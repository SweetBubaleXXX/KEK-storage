import { Request, Response } from 'express';

import { storageSpace } from '../utils/storage.utils';

export function storageInfo(req: Request, res: Response) {
  res.send(storageSpace);
};
