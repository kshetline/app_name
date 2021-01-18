import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { ScheduleModel } from '../models/schedule-model';

import { Repository } from './repository';

@Injectable()
export class SchedulerService extends Repository<ScheduleModel[]> {
  constructor(private injector: Injector) {
    super(injector);
  }

  getSchedule(): Observable<ScheduleModel[]> {
    return this.getOne('fleet/0/scheduler');
  }
}
