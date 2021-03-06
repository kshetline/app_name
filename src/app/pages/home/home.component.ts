import { Component, OnInit } from '@angular/core';
import { SchedulerService } from 'src/app/repositories/scheduler.service';

interface Task {
  id: number;
  parentId: number;
  title: string;
  start: Date;
  end: Date;
  progress: number;
}

interface Task2 {
  text: string;
  startDate: Date;
  endDate: Date;
}

interface Dependency {
  id: number;
  predecessorId: number;
  successorId: number;
  type: number;
}

interface Resource {
  id: number;
  text: string;
}

interface ResourceAssignment {
  id: number;
  taskId: number;
  resourceId: number;
}

@Component({
  templateUrl: './home.component.html',
  styleUrls: [ './home.component.scss' ]
})

export class HomeComponent implements OnInit {
  tasks: Task[] = [];
  tasks2: Task2[] = [];
  currentDate = new Date();
  dependencies: Dependency[] = [];
  resources: Resource[] = [];
  resourceAssignments: ResourceAssignment[];

  constructor(private scheduler: SchedulerService) {
    this.resources = [{ id: 1, text: 'time' }];
  }

  ngOnInit() {
    this.scheduler.getSchedule().subscribe(schedule => {
      let id = 0;
      const tasks: Task[] = [];
      const tasks2: Task2[] = [];
      const dependencies: Dependency[] = [];
      const resourceAssignments: ResourceAssignment[] = [];
      const now = Date.now();
      let minDate = Number.MAX_SAFE_INTEGER;
      let maxDate = Number.MIN_SAFE_INTEGER

      schedule.forEach(item => {
        minDate = Math.min(minDate, +item.DateIn);
        maxDate = Math.max(minDate, +item.DateOut);
      });

      tasks.push({
        id: ++id,
        parentId: 0,
        title: 'Schedule',
        start: new Date(minDate),
        end: new Date(maxDate),
        progress: 0
      });

      schedule.forEach((item, index) => {
        tasks.push({
          id: ++id,
          parentId: 1,
          title: `${item.RegNo}: ${item.PlanningCategory}`,
          start: item.DateIn,
          end: item.DateOut,
          progress: 0
        });

        // dependencies.push({
        //   id: id,
        //   predecessorId: id - 1,
        //   successorId: id + 1,
        //   type: 0
        // });

        // resourceAssignments.push({
        //   id: id,
        //   taskId: id,
        //   resourceId: 1
        // });

        tasks2.push({
          text: tasks[tasks.length - 1].title,
          startDate: item.DateIn,
          endDate: item.DateOut
        });
      });

      this.tasks = tasks;
      this.dependencies = dependencies;
      this.resourceAssignments = resourceAssignments;
      this.tasks2 = tasks2;
    });
  }
}
