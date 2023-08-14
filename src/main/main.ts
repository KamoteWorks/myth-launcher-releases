/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Tray,
  Menu,
  globalShortcut,
} from 'electron';
import * as dotenv from 'dotenv';
dotenv.config();
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
log.transports.file.resolvePath = () =>
  path.join('D:/_BACKUPS', 'logs/main.log');
log.info('hello', 'log');
log.warn('some problem appears');
import { execFile } from 'child_process';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import AxiosCustomInstance from './axios';
const fs = require('fs');
const crypto = require('crypto');
const unzipper = require('unzipper');
const gotTheLock = app.requestSingleInstanceLock();

let username: string;
let password: string;

let mainWindow: BrowserWindow;
let tray: Tray | null = null;
// Function to create the system tray
function createTray() {
  const currentWorkingDirectory = process.cwd();
  const trayIconPath = path.join(
    currentWorkingDirectory,
    'resources/assets/icon.ico'
  ); // Replace with the path to your tray icon
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open App',
      click: () => {
        // Add code to restore/show your app's main window here
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: () => {
        //clearSensitiveDirectories();
        app.exit();
      },
    },
  ]);

  tray.setToolTip('Myth Games Launcher');
  tray.setContextMenu(contextMenu);

  // Hide the main window when the app is minimized
  // mainWindow.on('minimize', () => {
  //   mainWindow.hide();
  // });

  // Show the main window when the tray icon is clicked
  tray.on('click', () => {
    mainWindow.show();
  });
}

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    mainWindow.show();
  });

  /* eslint-disable */
  class AppUpdater {
    constructor() {
      log.transports.file.level = 'info';
      autoUpdater.logger = log;
      autoUpdater.checkForUpdatesAndNotify();
    }
  }

  ipcMain.on('ipc-example', async (event, arg) => {
    const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
    console.log(msgTemplate(arg));
    event.reply('ipc-example', msgTemplate('pong'));
  });

  // Listen for IPC messages to maximize or unmaximize the window
  ipcMain.handle('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('check-client', async (event, user: any, pass: any) => {
    username = user;
    password = pass;
    const currentWorkingDirectory = process.cwd();
    const localVersion: any = process.env.SF_LOCAL_VERSION;
    const commonPath: any = process.env.SF_COMMON_PATH;
    const localVersionPath = path.join(
      currentWorkingDirectory,
      commonPath,
      localVersion
    );
    if (!fs.existsSync(localVersionPath)) {
      event.sender.send('installed-response', false);
    } else {
      await deleteGameFiles(event);
    }
  });

  ipcMain.on('launch-executable', async (event) => {
    await launchExecutable(event);
  });

  ipcMain.on('download-game-files', async (event) => {
    await downloadGameFiles(event);
  });

  ipcMain.on('repair-game-files', async (event) => {
    await repairGameFiles(event);
  });

  ipcMain.on('try-update', async (event) => {
    await tryUpdate(event);
  });

  ipcMain.on('coming-soon', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Myth Games',
      message: 'Coming Soon.',
    });
  });

  async function getUserParameter(u: string, p: string): Promise<string> {
    const username = u;
    const password = p;
    const encrypt = username + ',' + password;
    const encode = (str: string): string =>
      Buffer.from(str, 'binary').toString('base64');
    return encode(encrypt);
    /*
    const decode = (str: string): string =>
      Buffer.from(str, 'base64').toString('binary');
      const decrypt = encode(encrypt);
    */
  }

  async function launchExecutable(event: Electron.IpcMainEvent) {
    const param = await getUserParameter(username, password);
    const currentWorkingDirectory = process.cwd();
    const commonPath: any = process.env.SF_COMMON_PATH;
    const exeName: any = process.env.SF_EXECUTABLE;
    const exePath = path.join(currentWorkingDirectory, commonPath, exeName);
    const parameters = [param];
    const exeProcess = execFile(exePath, parameters, (error) => {
      if (error?.message.includes('ENOENT')) {
        console.error(`${exeName} not found: Launcher will start repairing.`);
        dialog.showErrorBox(
          'Error',
          `${exeName} not found: Launcher will start repairing.`
        );
        repairGameFiles(event);
        return;
      } else if (error?.message.includes('EACCES')) {
        console.error(`Access to ${exeName} is denied.`);
        dialog.showErrorBox('Error', `Access to ${exeName} is denied.`);
        return;
      }
      const progress = 0;
      exeRunning(event, true, progress);
    });

    exeProcess.on('close', () => {
      const progress = 100;
      exeRunning(event, false, progress);
    });

    exeProcess.on('error', (err: any) => {
      const progress = 100;
      exeRunning(event, false, progress);
      dialog.showErrorBox('Error', err);
    });
  }

  async function exeRunning(
    event: Electron.IpcMainEvent,
    status: boolean,
    progress: number
  ) {
    let data = {
      progress: progress,
      progressText: status,
      runningState: status,
    };
    event.sender.send('button-disabled-response', status);
    event.sender.send('patch-files-response', data);
    status ? mainWindow.hide() : null;
  }

  async function deleteGameFiles(event: Electron.IpcMainEvent) {
    const currentWorkingDirectory = process.cwd();
    const commonPath: any = process.env.SF_COMMON_PATH;
    const gameFolderPath = path.join(currentWorkingDirectory, commonPath);
    const deleteManifestPath = process.env.SF_DELETE_URL;
    const progress = 0;
    const progressText = 'verifying integrity of game files...';
    let data = {
      progress: progress,
      progressText: progressText,
    };
    event.sender.send('button-disabled-response', true);
    event.sender.send('patch-files-response', data);
    try {
      const response = await AxiosCustomInstance.getInstance().request({
        method: 'GET',
        url: deleteManifestPath,
      });
      const deleteManifest = response.data; // Extract the JSON data from the response
      const deleteFiles = deleteManifest.files;
      for await (const file of deleteFiles) {
        const { name } = file;
        const subfolderPath = path.dirname(name); // Get the directory part of the file name
        const localFilePath = path.join(
          gameFolderPath,
          subfolderPath,
          path.basename(name)
        );

        if (fs.existsSync(localFilePath)) {
          fs.rm(localFilePath, { recursive: true }, (err: any) => {
            if (err) {
            } else {
            }
          });
        }
      }
      checkUpdates(event);
    } catch (error) {
      checkUpdates(event);
      console.error(error);
    }
  }

  async function downloadGameFiles(event: Electron.IpcMainEvent) {
    const title = 'Downloading';
    const progress = 0;
    const progressText = 'Initializing download...';
    let data = {
      progress: progress,
      progressText: progressText,
    };
    event.sender.send('installed-response', true);
    event.sender.send('button-disabled-response', true);
    event.sender.send('patch-files-response', data);
    const currentWorkingDirectory = process.cwd();
    const commonPath: any = process.env.SF_COMMON_PATH;
    const gameFolderPath = path.join(currentWorkingDirectory, commonPath);
    const patchManifestPath = process.env.SF_MANIFEST_URL;
    try {
      const response = await AxiosCustomInstance.getInstance().request({
        method: 'GET',
        url: patchManifestPath,
      });
      const patchManifest = response.data; // Extract the JSON data from the response
      const patchFiles = patchManifest.files;
      const totalFiles = patchFiles.length;
      let processedFiles = 0;
      for await (const file of patchFiles) {
        const { name, url, md5, sizeBytes } = file;
        const subfolderPath = path.dirname(name); // Get the directory part of the file name
        const localFilePath = path.join(
          gameFolderPath,
          subfolderPath,
          path.basename(name)
        );

        let shouldDownload = false;

        if (!fs.existsSync(localFilePath)) {
          shouldDownload = true;
        } else {
          try {
            const md5Matches = await checkFileMD5(localFilePath, md5);
            if (!md5Matches) {
              shouldDownload = true;
            }
          } catch (error) {
            console.error(`Error checking MD5 for file ${name}: ${error}`);
            shouldDownload = true;
          }
        }

        if (shouldDownload) {
          await downloadAndPatchFiles(
            event,
            url,
            gameFolderPath,
            subfolderPath, // Pass the subfolder path
            path.basename(name), // Pass only the base name of the file
            sizeBytes,
            title,
            false
          );
        }

        processedFiles++;
        const progress = (processedFiles / totalFiles) * 100;
        const progressText = `Validating: ${file.name}`;
        let data = {
          progress: progress,
          progressText: progressText,
        };
        event.sender.send('patch-files-response', data);
      }
      const progress = 100;
      let data = {
        progress: progress,
        progressText: false,
      };
      event.sender.send('button-disabled-response', false);
      event.sender.send('patch-files-response', data);
      dialog.showMessageBox({
        type: 'info',
        title: 'Success',
        message: 'Game files downloaded successfully.',
      });
    } catch (error) {
      downloadGameFiles(event);
    }
  }

  async function repairGameFiles(event: Electron.IpcMainEvent) {
    const title = 'Repairing';
    const progress = 0;
    const progressText = 'Initializing repair...';
    let data = {
      progress: progress,
      progressText: progressText,
    };
    event.sender.send('button-disabled-response', true);
    event.sender.send('patch-files-response', data);
    const currentWorkingDirectory = process.cwd();
    const commonPath: any = process.env.SF_COMMON_PATH;
    const gameFolderPath = path.join(currentWorkingDirectory, commonPath);
    const patchManifestPath = process.env.SF_MANIFEST_URL;
    try {
      const response = await AxiosCustomInstance.getInstance().request({
        method: 'GET',
        url: patchManifestPath,
      });
      const patchManifest = response.data; // Extract the JSON data from the response
      const patchFiles = patchManifest.files;
      const totalFiles = patchFiles.length;
      let processedFiles = 0;
      for (const file of patchFiles) {
        const { name, url, md5, sizeBytes } = file;
        const subfolderPath = path.dirname(name); // Get the directory part of the file name
        const localFilePath = path.join(
          gameFolderPath,
          subfolderPath,
          path.basename(name)
        );

        let shouldDownload = false;

        if (!fs.existsSync(localFilePath)) {
          shouldDownload = true;
        } else {
          try {
            const md5Matches = await checkFileMD5(localFilePath, md5);
            if (!md5Matches) {
              shouldDownload = true;
            }
          } catch (error) {
            console.error(`Error checking MD5 for file ${name}: ${error}`);
            shouldDownload = true;
          }
        }

        if (shouldDownload) {
          await downloadAndPatchFiles(
            event,
            url,
            gameFolderPath,
            subfolderPath, // Pass the subfolder path
            path.basename(name), // Pass only the base name of the file
            sizeBytes,
            title,
            true
          );
        }

        processedFiles++;
        const progress = (processedFiles / totalFiles) * 100;
        const progressText = `Verifying: ${file.name}`;
        event.sender.send('patch-files-response', {
          progress,
          progressText,
        });
      }
      const progress = 100;
      let data = {
        progress: progress,
        progressText: false,
      };
      event.sender.send('button-disabled-response', false);
      event.sender.send('patch-files-response', data);
      dialog.showMessageBox({
        type: 'info',
        title: 'Success',
        message: 'Game files repaired successfully.',
      });
    } catch (error) {
      console.log(error);
      const progress = 0;
      const progressText = 'Reconnecting...';
      let data = {
        progress: progress,
        progressText: progressText,
      };
      event.sender.send('patch-files-response', data);
      repairGameFiles(event);
    }
  }

  async function downloadAndPatchFiles(
    event: Electron.IpcMainEvent,
    url: string,
    gameFolderPath: string,
    subfolderPath: string, // New parameter for subfolder path // Pass only the base name of the file
    fileName: string,
    sizeBytes: any,
    title: string,
    isRepair: boolean
  ) {
    const response = await AxiosCustomInstance.getInstance().request({
      method: 'GET',
      url: url,
      responseType: 'stream',
    });
    const totalSize = sizeBytes;
    let downloadedSize = 0;
    let startTime = Date.now();
    // Create the full path, including subfolders
    const fullPath = path.join(gameFolderPath, subfolderPath);

    // Create subfolders if they don't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    const targetPath = path.join(gameFolderPath, subfolderPath, fileName);
    const fileNamePath = path.join(subfolderPath, fileName);
    const writeStream = fs.createWriteStream(targetPath);

    response.data.on('data', (chunk: string | any[]) => {
      writeStream.write(chunk);
      downloadedSize += chunk.length;

      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      const downloadSpeed = downloadedSize / elapsedTime; // Bytes per second

      const downloadedMB = bytesToMegabytes(downloadedSize);
      const totalMB = bytesToMegabytes(totalSize);
      const progress = (downloadedSize / totalSize) * 100;
      let progressText;
      isRepair
        ? (progressText = `${title}: ${fileNamePath} − ${downloadedMB}/${totalMB} MB (${progress.toFixed(
            2
          )}%)`)
        : (progressText = `${title}: ${fileNamePath} − ${downloadedMB}/${totalMB} MB (${progress.toFixed(
            2
          )}%) − ${formatBytes(downloadSpeed)}/s`);
      let data = {
        progress: '',
        progressText: progressText,
      };
      event.sender.send('patch-files-response', data);
    });
    response.data.on('end', () => {
      if (downloadedSize !== totalSize) {
        dialog.showErrorBox('Error', 'Server Error Code: 410');
      }
      writeStream.end();
    });

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  }

  async function tryUpdate(event: Electron.IpcMainEvent) {
    const currentWorkingDirectory = process.cwd();
    const remoteVersionURL = process.env.SF_VERSION_URL;
    const localVersion: any = process.env.SF_LOCAL_VERSION;
    const commonPath: any = process.env.SF_COMMON_PATH;
    const gamePath = path.join(currentWorkingDirectory, commonPath);
    const localVersionPath = path.join(
      currentWorkingDirectory,
      commonPath,
      localVersion
    );
    const patchDirectory = path.join(
      currentWorkingDirectory,
      commonPath,
      'patches'
    );

    const progress = 0;
    const progressText = 'Initializing patch updates...';
    let data = {
      progress: progress,
      progressText: progressText,
    };
    event.sender.send('update-response', true);
    event.sender.send('installed-response', true);
    event.sender.send('patch-files-response', data);
    // Download remote version file

    try {
      const response = await AxiosCustomInstance.getInstance().request({
        method: 'GET',
        url: remoteVersionURL,
        responseType: 'stream',
      });
      let remoteVersionData = '';

      response.data.on('data', (chunk: string | any[]) => {
        remoteVersionData += chunk;
      });

      response.data.on('end', () => {
        try {
          const remoteData = JSON.parse(remoteVersionData);
          const localData = JSON.parse(
            fs.readFileSync(localVersionPath, 'utf-8')
          );

          const availableVersions = remoteData.versions.filter(
            (version: any) => version.version > localData.version
          );
          if (availableVersions.length > 0) {
            // Download and apply patches for each available version
            let patchPromises = [];
            for (const version of availableVersions) {
              const patchURL = `${process.env.SF_PATCH_URL}${version.patchFileName}`;

              patchPromises.push(
                downloadAndApplyPatch(
                  event,
                  patchURL,
                  gamePath,
                  patchDirectory,
                  localVersionPath,
                  version.sizeBytes,
                  version.version
                )
              );
            }

            Promise.all(patchPromises)
              .then(() => {
                const latestVersion =
                  availableVersions[availableVersions.length - 1].version;
                event.sender.send('patch-applied', latestVersion);
              })
              .catch((error) => {
                console.error(
                  'Patch Error',
                  `An error occurred while applying the patches: ${error}`
                );
                tryUpdate(event);
              });
          } else {
            const progress = 100;
            let data = {
              progress: progress,
              progressText: false,
            };
            event.sender.send('update-response', true);
            event.sender.send('patch-files-response', data);
          }
        } catch (error) {
          console.error(
            'Update Check Error',
            `An error occurred while checking for updates: ${error}`
          );
          //retry
          tryUpdate(event);
        }
      });
    } catch (error) {
      console.error(
        'Update Check Error',
        `An error occurred while checking for updates: ${error}`
      );
      //retry
      tryUpdate(event);
    }
  }

  async function checkUpdates(event: Electron.IpcMainEvent) {
    const currentWorkingDirectory = process.cwd();
    const remoteVersionURL = process.env.SF_VERSION_URL;
    const localVersion: any = process.env.SF_LOCAL_VERSION;
    const commonPath: any = process.env.SF_COMMON_PATH;
    const localVersionPath = path.join(
      currentWorkingDirectory,
      commonPath,
      localVersion
    );

    const progress = 0;
    const progressText = 'Checking for updates...';
    let data = {
      progress: progress,
      progressText: progressText,
    };
    event.sender.send('button-disabled-response', true);
    event.sender.send('patch-files-response', data);
    // Download remote version file
    try {
      const response = await AxiosCustomInstance.getInstance().request({
        method: 'GET',
        url: remoteVersionURL,
        responseType: 'stream',
      });
      let remoteVersionData = '';

      response.data.on('data', (chunk: string | any[]) => {
        remoteVersionData += chunk;
      });

      response.data.on('end', () => {
        try {
          const remoteData = JSON.parse(remoteVersionData);
          const localData = JSON.parse(
            fs.readFileSync(localVersionPath, 'utf-8')
          );

          const availableVersions = remoteData.versions.filter(
            (version: any) => version.version > localData.version
          );
          if (availableVersions.length > 0) {
            event.sender.send('update-response', false);
          } else {
            const progress = 100;
            let data = {
              progress: progress,
              progressText: false,
            };
            event.sender.send('button-disabled-response', false);
            event.sender.send('update-response', true);
            event.sender.send('patch-files-response', data);
          }
        } catch (error) {
          console.error(
            'Update Check Error',
            `An error occurred while checking for updates: ${error}`
          );
          //retry
          checkUpdates(event);
        }
      });
    } catch (error) {
      //retry
      console.error(
        'Update Check Error',
        `An error occurred while checking for updates: ${error}`
      );
      checkUpdates(event);
    }
  }

  async function downloadAndApplyPatch(
    event: Electron.IpcMainEvent,
    patchURL: string,
    gamePath: string,
    patchDirectory: string,
    localVersionPath: string,
    sizeBytes: number,
    patchVersion: any
  ) {
    const response = await AxiosCustomInstance.getInstance().request({
      method: 'GET',
      url: patchURL,
      responseType: 'stream',
    });
    const title = 'Patching';
    const totalSize = sizeBytes;
    let downloadedSize = 0;
    let startTime = Date.now();

    // Create subfolders if they don't exist
    if (!fs.existsSync(patchDirectory)) {
      fs.mkdirSync(patchDirectory, { recursive: true });
    }
    const patchFileName = patchURL.split('/').pop();
    const patchPath = `${patchDirectory}/${patchFileName}`;
    const file = fs.createWriteStream(patchPath);

    response.data.on('data', (chunk: string | any[]) => {
      file.write(chunk);
      downloadedSize += chunk.length;

      const currentTime = Date.now();
      const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds
      const downloadSpeed = downloadedSize / elapsedTime; // Bytes per second

      const downloadedMB = bytesToMegabytes(downloadedSize);
      const totalMB = bytesToMegabytes(totalSize);
      const progress = (downloadedSize / totalSize) * 100;
      let progressText;
      progressText = `${title}: ${patchFileName} − ${downloadedMB}/${totalMB} MB (${progress.toFixed(
        2
      )}%) − ${formatBytes(downloadSpeed)}/s`;
      let data = {
        progress: progress,
        progressText: progressText,
      };
      event.sender.send('patch-files-response', data);
    });

    response.data.on('end', () => {
      file.end(() => {
        extractPatch(event, gamePath, patchPath, patchDirectory)
          .then(() => {
            updateLocalVersion(localVersionPath, patchVersion);
            //resolve();
          })
          .catch((error) => {
            console.log(error);
            //reject(error);
          });
      });
    });

    return new Promise((resolve, reject) => {
      file.on('finish', resolve);
      file.on('error', reject);
    });
  }

  async function extractPatch(
    event: Electron.IpcMainEvent,
    gamePath: any,
    patchPath: string,
    patchDirectory: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const extractionPath = `${patchDirectory}`;
      let progressText: string;
      fs.createReadStream(patchPath)
        .pipe(unzipper.Extract({ path: gamePath }))
        .on('entry', (entry: any) => {
          if (entry.type === 'File') {
            //sender.send("extraction-file", entry.path);
            progressText = entry.path;
          }
          entry.autodrain();
        })
        .on('close', () => {
          let extractedFilesCount = 0;
          let totalFilesCount = 0;

          fs.readdir(extractionPath, (err: any, files: any) => {
            if (err) {
              reject(err);
              return;
            }

            totalFilesCount = files.length;

            files.forEach((file: any) => {
              const filePath = `${extractionPath}/${file}`;
              const destinationPath = `${patchDirectory}/${file}`;

              fs.rename(filePath, destinationPath, (err: any) => {
                if (err) {
                  reject(err);
                  return;
                }

                extractedFilesCount++;

                const progress = (extractedFilesCount / totalFilesCount) * 100;
                let data = {
                  progress: progress,
                  progressText: progressText,
                };
                event.sender.send('patch-files-response', data);

                if (extractedFilesCount === totalFilesCount) {
                  fs.rmdir(extractionPath, { recursive: true }, (err: any) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  });
                }
              });
            });
          });
        })
        .on('error', (error: any) => {
          reject(error);
        });
    });
  }

  function updateLocalVersion(localVersionPath: string, version: any) {
    const localVersionData = {
      version: version,
    };
    fs.writeFileSync(
      localVersionPath,
      JSON.stringify(localVersionData, null, 2)
    );
  }

  async function checkFileMD5(filePath: string, expectedMD5: any) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const input = fs.createReadStream(filePath);

      input.on('error', (error: any) => {
        reject(error);
      });

      input.on('data', (chunk: any) => {
        hash.update(chunk);
      });

      input.on('end', () => {
        const fileMD5 = hash.digest('hex');
        resolve(fileMD5 === expectedMD5);
      });
    });
  }

  const bytesToMegabytes = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  function formatBytes(bytes: number) {
    if (bytes < 1024) {
      return bytes.toFixed(2) + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  // Listen for IPC message to minimize the window
  ipcMain.handle('minimize-window', () => {
    mainWindow.minimize();
  });

  // Listen for IPC message to close the window
  ipcMain.handle('close-window', () => {
    mainWindow.close();
  });

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  const isDebug =
    process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

  if (isDebug) {
    require('electron-debug')();
  }

  const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload
      )
      .catch(console.log);
  };

  const createWindow = async () => {
    if (isDebug) {
      await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
      show: false,
      width: 1250,
      height: 800,
      minWidth: 1250,
      minHeight: 800,
      resizable: false,
      maximizable: true,
      autoHideMenuBar: true,
      frame: false,
      transparent: true,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        webSecurity: false,
        sandbox: false,
        devTools: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('system-context-menu', (event, _point) => {
      event.preventDefault();
    });

    mainWindow.on('ready-to-show', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else {
        mainWindow.show();
      }
      createTray();
    });
    app.on('will-quit', () => {
      // Unregister the global shortcut when the app is about to quit
      globalShortcut.unregister('F11');
    });
    mainWindow.on('close', (event) => {
      event.preventDefault(); // Prevent the default close behavior (quitting the app)
      mainWindow.hide(); // Hide the window instead
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  };

  /**
   * Add event listeners...
   */

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      // Clean up and remove lockfile when the window is closed
      app.quit();
    }
  });

  autoUpdater.on('update-available', () => {
    log.info('update-available');
  });

  autoUpdater.on('checking-for-update', () => {
    log.info('checking-for-update');
  });

  autoUpdater.on('download-progress', () => {
    log.info('download-progress');
  });

  autoUpdater.on('update-downloaded', () => {
    log.info('update-downloaded');
  });

  app
    .whenReady()
    .then(() => {
      createWindow();
      autoUpdater.checkForUpdatesAndNotify();
      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });
      globalShortcut.register('F11', () => {
        // Do nothing to prevent the default behavior
      });
    })
    .catch(console.log);
}
