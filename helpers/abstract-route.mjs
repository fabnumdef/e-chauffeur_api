import Router from 'koa-router';
import maskOutput from '../middlewares/mask-output';
import checkRights from '../middlewares/check-rights';
import addFilter from '../middlewares/add-filter';

export function addCreateToRouter(Model, { url = '/', right, main } = {}) {
  if (!right) {
    throw new Error('Right should be defined');
  }
  const autoGenId = !Model.schema.obj._id;
  this.post(
    url,
    checkRights(right),
    maskOutput,
    main || (async (ctx) => {
      const { request: { body } } = ctx;

      if (!autoGenId) {
        if (await Model.findById(body.id)) {
          ctx.throw_and_log(409, `${Model.modelName} "${body.id}" already exists`);
        }

        Object.assign(body, { _id: body.id });
      }
      ctx.body = await Model.create(body);
      ctx.log(ctx.log.INFO, `${Model.modelName} "${body.id}" has been created`);
    }),
  );
}

export function addListToRouter(Model, { url = '/', right, main, filters = {}, middlewares = [] } = {}) {
  if (!right) {
    throw new Error('Right should be defined');
  }

  this.get(
    url,
    checkRights(right),
    maskOutput,
    ...Object.keys(filters).map(k => addFilter(k, filters[k])),
    ...middlewares,
    main || (async (ctx) => {
      const { offset, limit } = ctx.parseRangePagination(Model);
      const total = await Model.countDocuments(ctx.filters);
      const data = await Model.find(ctx.filters).skip(offset).limit(limit).lean();
      ctx.log(
        ctx.log.INFO,
        `Find query in ${Model.modelName}`,
        { filters: ctx.filters, offset, limit },
      );
      ctx.setRangePagination(Model, { total, offset, count: data.length });
      ctx.body = data;
    }),
  );
}

export function addGetToRouter(Model, { url = '/:id', right, main } = {}) {
  this.get(
    url,
    checkRights(right),
    maskOutput,
    main || (async (ctx) => {
      const { params: { id } } = ctx;
      try {
        ctx.body = await Model.findById(id).lean();
        ctx.log(
          ctx.log.INFO,
          `Find ${Model.modelName} with "${id}"`,
        );
      } catch (e) {
        ctx.throw_and_log(404, `${Model.modelName} "${id}" not found`);
      }
    }),
  );
}

export function addDeleteToRouter(Model, { url = '/:id', right, main } = {}) {
  this.del(
    url,
    checkRights(right),
    main || (async (ctx) => {
      const { params: { id } } = ctx;
      await Model.remove({ _id: id });
      ctx.log(
        ctx.log.INFO,
        `${Model.modelName} "${id}" has been removed`,
      );
      ctx.status = 204;
    }),
  );
}

export function addUpdateToRouter(Model, { url = '/:id', right, main } = {}) {
  this.patch(
    url,
    checkRights(right),
    maskOutput,
    main || (async (ctx) => {
      const { request: { body } } = ctx;

      const { params: { id } } = ctx;
      const model = await Model.findById(id);

      model.set(body);
      ctx.body = await model.save();
      ctx.log(
        ctx.log.INFO,
        `${Model.modelName} "${id}" has been modified`,
        { body },
      );
    }),
  );
}

export default (Model, {
  router, create, list, get, delete: remove, update,
} = {}) => {
  const routerInstance = router || new Router();
  if (create) {
    addCreateToRouter.call(routerInstance, Model, create);
  }
  if (list) {
    addListToRouter.call(routerInstance, Model, list);
  }
  if (get) {
    addGetToRouter.call(routerInstance, Model, get);
  }
  if (remove) {
    addDeleteToRouter.call(routerInstance, Model, remove);
  }
  if (update) {
    addUpdateToRouter.call(routerInstance, Model, update);
  }
  return routerInstance;
};
