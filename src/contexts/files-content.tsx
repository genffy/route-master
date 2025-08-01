import { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

interface Task {
  id: number;
  text: string;
  done: boolean;
}

interface TaskAction {
  type: 'added' | 'changed' | 'deleted';
  id?: number;
  text?: string;
  task?: Task;
}

const TasksContext = createContext<Task[] | null>(null);
const TasksDispatchContext = createContext<Dispatch<TaskAction> | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(
    tasksReducer,
    initialTasks
  );

  return (
    <TasksContext.Provider value={tasks} >
      <TasksDispatchContext.Provider
        value={dispatch}
      >
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  );
}

export function useTasks() {
  return useContext(TasksContext);
}

export function useTasksDispatch() {
  return useContext(TasksDispatchContext);
}

function tasksReducer(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'added': {
      return [...tasks, {
        id: action.id!,
        text: action.text!,
        done: false
      }];
    }
    case 'changed': {
      return tasks.map((t: Task) => {
        if (t.id === action.task!.id) {
          return action.task!;
        } else {
          return t;
        }
      });
    }
    case 'deleted': {
      return tasks.filter((t: Task) => t.id !== action.id);
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

const initialTasks = [
  { id: 0, text: 'Philosopher’s Path', done: true },
  { id: 1, text: 'Visit the temple', done: false },
  { id: 2, text: 'Drink matcha', done: false }
];
