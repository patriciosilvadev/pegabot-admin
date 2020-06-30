import fs from 'fs';
import got from 'got';
import DirectusSDK from '@directus/sdk-js';
import AdmZip from 'adm-zip';
import mailer from './mailer';
import help from './helper';

const userRequestsCollection = 'user_files';
const emailLogCollection = 'email_log';

const directusUrl = process.env.DIRECTUS_URL;
const directusProject = process.env.DIRECTUS_PROJECT;
const directusEmail = process.env.DIRECTUS_USER_EMAIL;
const directusPass = process.env.DIRECTUS_USER_PASSWORD;

const inPath = `${process.env.NODE_PATH}/in`;
const outPath = `${process.env.NODE_PATH}/out`;

async function getDirectusClient() {
  const client = new DirectusSDK({
    url: directusUrl,
    project: directusProject,
  });

  await client.login({
    email: directusEmail,
    password: directusPass,
  });

  return client;
}

async function getFilesToProcess() {
  const client = await getDirectusClient();

  // search for files with status "waitin"
  const toProcess = await client.getItems(userRequestsCollection, { filter: { status: { eq: 'waiting' } } });

  // no files to process were found
  if (!toProcess || !toProcess.data || toProcess.data.length === 0) return null;

  const { data: allFiles } = await client.getFiles();
  const desiredFiles = [];

  // get details of all the files we want
  toProcess.data.forEach((e) => {
    const currentFile = allFiles.find((x) => x.id === e.file);
    currentFile.itemID = e.id;
    desiredFiles.push(currentFile);
  });

  return desiredFiles;
}

async function saveFilesToDisk(files) {
  for (const file of files) { // eslint-disable-line

    if (file.filename_download.endsWith('.zip')) { // handle zip files
      const res = await got(file.data.full_url, { responseType: 'buffer' }); // eslint-disable-line

      const zip = new AdmZip(res.body); // load zip buffer
      const zipEntries = zip.getEntries();

      // rename files inside of zip to prefix the item id
      zipEntries.forEach((entry) => { entry.entryName = `${file.itemID}_${entry.entryName}`; }); // eslint-disable-line no-param-reassign

      zip.extractAllTo(inPath); // extract files from zip
    } else if (file.filename_download.endsWith('.csv')) {
      const newFilePath = `${inPath}/${file.id}_${file.filename_download}`;
      const res = await got(file.data.full_url); // eslint-disable-line
      fs.writeFileSync(newFilePath, res.body);
    }
  }
}

async function sendMail(item, file) {
  const client = await getDirectusClient();

  const { email } = item;
  // send e-mail with attachment
  const mailSent = await mailer.sendEmail(email, 'seus resultados', 'seus resultados', [{
    filename: file.filename,
    content: file.content,
  }]);

  // format attributes to save on the email_log collection
  const attributes = {
    request_id: item.id, // the id of the requeste for analysis
    file_id: item.result_file, // the result file id
    sent_to: email,
    sent_at: help.dateMysqlFormat(new Date()),
    status: 'sent', // might be overwritten if something goes wrong
  };

  // save e-mail error
  if (!mailSent || mailSent.error) {
    attributes.status = 'error';
    if (mailSent.error && mailSent.error.message) attributes.error = mailSent.error.message;
  }

  // save email log
  const res = await client.createItem(emailLogCollection, attributes);

  if (!res || !res.data) throw new Error('Could not save email log');

  return attributes.status !== 'error';
}

async function saveFileToDirectus(fileName) {
  const client = await getDirectusClient();

  const localfile = `${outPath}/${fileName}`;
  const zip = new AdmZip(); // create archive
  await zip.addLocalFile(localfile); // add local file
  const willSendthis = zip.toBuffer(); // get everything as a buffer
  const newFileName = fileName.replace('csv', 'zip');

  const fileData = await client.uploadFiles({
    title: newFileName, data: willSendthis.toString('base64'), filename_disk: newFileName, filename_download: newFileName,
  });

  const fileID = fileData.data.id; // get the file id
  const itemID = fileName.substr(0, fileName.indexOf('_')); // find the item this file should be uploaded to (numbers before the first underline)

  const updatedItem = await client.updateItem(userRequestsCollection, itemID, { result_file: fileID, status: 'complete' });
  // if item was uploaded correctly
  if (updatedItem && updatedItem.data && updatedItem.data.id) {
    if (updatedItem.data.email) { // if there's an e-mail set, send the result file to the e-mail
      const canDelete = await sendMail(updatedItem.data,
        { filename: newFileName, content: willSendthis });
      // delete file from /out only if it was sent by e-mail successfully
      if (canDelete) fs.unlinkSync(localfile);
    } else {
      fs.unlinkSync(localfile); // delete file from /out
    }
  }
}

// save each file inside of the /out directory on direct
async function getResults() {
  fs.readdir(outPath, (err, filenames) => {
    if (err) { return; }

    filenames.forEach(async (fileName) => {
      await saveFileToDirectus(fileName);
    });
  });
}

async function populateIn() {
  const files = await getFilesToProcess();
  if (files) await saveFilesToDisk(files);
}

export default { populateIn, getResults };
