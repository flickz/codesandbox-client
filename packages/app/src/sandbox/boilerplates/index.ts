import { getCurrentManager } from '../compile';

export interface IBoilerplate {
  extension: string;
  condition: (path: string) => boolean;
  code: string;
  /**
   * Normally we only execute boilerplates in module mode. By setting this to true we will
   * execute the boilerplate in any mode.
   */
  enabledByDefault?: boolean;
}

let cachedBoilerplates = [];

export async function evalBoilerplates(boilerplates) {
  cachedBoilerplates = await Promise.all(
    boilerplates.map(async boilerplate => {
      const fakeModule = {
        path: `/boilerplate-${boilerplate.condition}${boilerplate.extension}`,
        code: boilerplate.code,
      };

      const manager = getCurrentManager();

      await manager.transpileModules(fakeModule);
      const module = manager.evaluateModule(fakeModule);

      return { ...boilerplate, module };
    })
  );
}

export function getBoilerplates() {
  return cachedBoilerplates;
}

export function findBoilerplate(module) {
  const boilerplates = getBoilerplates();
  const boilerplate = boilerplates.find(b => {
    const regex = new RegExp(b.condition);
    return regex.test(module.path);
  });

  if (boilerplate == null) {
    throw new Error(
      `No boilerplate found for ${module.path}, you can create one in the future`
    );
  }

  return boilerplate;
}