import dotenv from 'dotenv';
import path from 'path';
import { tmpdir, hostname } from 'os';
import { constants as modes } from 'fs';
import { v5 as uuidv5 } from 'uuid';

const DEFAULT_STORAGE_SIZE_LIMIT = 10737418240; // 10GB

export default class Config {
  readonly PORT: number;
  STORAGE_PATH: string;
  STORAGE_SIZE_LIMIT: number;
  readonly STORAGE_ID: string;
  BACKUP_FILES_MAX_AGE: number;
  readonly TOKEN_SALT: string;
  readonly ALLOWED_TOKENS: string[];
  readonly FILE_MODE: number;

  constructor(configPath?: string, override: boolean = false) {
    dotenv.config({ path: configPath, override });
    this.PORT = +(process.env.PORT || 3000);
    this.STORAGE_PATH = path.resolve(process.env.STORAGE_PATH || path.join(tmpdir(), 'KEK-storage'));
    this.STORAGE_SIZE_LIMIT = +(process.env.STORAGE_SIZE_LIMIT || DEFAULT_STORAGE_SIZE_LIMIT);
    this.STORAGE_ID = process.env.STORAGE_ID || uuidv5(`http://${hostname()}:${this.PORT}`, uuidv5.URL);
    this.BACKUP_FILES_MAX_AGE = +(process.env.BACKUP_FILES_MAX_AGE || 0);
    this.TOKEN_SALT = process.env.TOKEN_SALT || '';
    this.ALLOWED_TOKENS = (process.env.ALLOWED_TOKENS || 'localhost').split(' ');
    this.FILE_MODE = modes.S_IRUSR | modes.S_IWUSR | modes.S_IXUSR | modes.S_IRGRP;
  }

  update(configObj: Config): Config {
    return Object.assign(this, configObj);
  }
};
