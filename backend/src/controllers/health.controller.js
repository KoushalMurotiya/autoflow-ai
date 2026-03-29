import * as healthService from '../services/health.service.js';

export function getHealth(_req, res, next) {
  try {
    const body = healthService.getHealthMessage();
    res.type('text/plain').send(body);
  } catch (err) {
    next(err);
  }
}
