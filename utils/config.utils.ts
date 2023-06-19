import dotenv from 'dotenv';
import path from 'path';
import { constants as modes } from 'fs';

export default class Config {
  readonly PORT: number;
  STORAGE_PATH: string;
  STORAGE_SIZE_LIMIT: number;
  readonly STORAGE_ID: string;
  readonly TOKEN_SALT: string;
  readonly ALLOWED_TOKENS: string[];
  readonly FILE_MODE: number;

  constructor(configPath?: string, override: boolean = false) {
    dotenv.config({ path: configPath, override });
    this.PORT = +process.env.PORT! || 3000;
    this.STORAGE_PATH = path.resolve(__dirname, '..', process.env.STORAGE_PATH || '');
    this.STORAGE_SIZE_LIMIT = +process.env.STORAGE_SIZE_LIMIT!;
    this.STORAGE_ID = process.env.STORAGE_ID!;
    this.TOKEN_SALT = process.env.TOKEN_SALT || '';
    this.ALLOWED_TOKENS = (process.env.ALLOWED_TOKENS || '').split('|');
    this.FILE_MODE = modes.S_IRUSR | modes.S_IWUSR | modes.S_IXUSR | modes.S_IRGRP;
  }

  update(configObj: Config): Config {
    return Object.assign(this, configObj);
  }
};
