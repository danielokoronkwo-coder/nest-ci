/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './types/task-status.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-task-filter.dto';
import { TasksRepository } from './repository/task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { User } from 'src/auth/users/entities/user.entity';

@Injectable()
export class TasksService {

  constructor(
    @InjectRepository(TasksRepository)
    private readonly taskRepository: TasksRepository
    ) {}

    getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
      return this.taskRepository.getTask(filterDto,user);
    }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepository.findOne({ where: { id, userId: user.id }})
    
    if (!found) {
      throw new NotFoundException(`Task with id ${id} not found`)
    }

    return found
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async updateTaskById(id: number, status: TaskStatus, user: User): Promise<Task> {
    let task = await this.getTaskById(id, user);
    task.status = status;
    await task.save()
    return task
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const result = await this.taskRepository.delete({ id, userId: user.id })
    if (result.affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`)
    }
  }
}
