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
  dependencies: Dependency[] = [];
  resources: Resource[] = [];
  resourceAssignments: ResourceAssignment[];

  constructor(private scheduler: SchedulerService) {
    this.resources = [{ id: 0, text: 'time' }];
  }

  ngOnInit() {
    this.scheduler.getSchedule().subscribe(schedule => {
      let id = 0;
      const tasks: Task[] = [];
      const dependencies: Dependency[] = [];
      const resourceAssignments: ResourceAssignment[] = [];
      const now = Date.now();

      schedule.forEach((item, index) => {
        tasks.push({
          id: ++id,
          parentId: 0,
          title: `${item.RegNo}: ${item.PlanningCategory}`,
          start: item.DateIn,
          end: item.DateOut,
          progress: 0
        });

        dependencies.push({
          id: id,
          predecessorId: id - 1,
          successorId: id + 1,
          type: 0
        });

        resourceAssignments.push({
          id: id,
          taskId: id,
          resourceId: 1
        });
      });

      this.tasks = tasks;
      this.dependencies = dependencies;
      this.resourceAssignments = resourceAssignments;
      console.log(this.tasks);
    });
  }
}
