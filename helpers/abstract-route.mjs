import Router from '@koa/router';
import maskOutput from '../middlewares/mask-output';
import resolveRights from '../middlewares/check-rights';
import addFilter from '../middlewares/add-filter';
import initFilters from '../middlewares/init-filters';
import APIError from './api-error';

export function addBatchToRouter(Model, {
  url = '/batch', right, rights = [], middlewares = [], main, refs = [],
} = {}) {
  if (!right) {
    throw new APIError(403, 'Right should be defined');
  }
  this.post(
    url,
    ...[right]
      .concat(rights)
      .filter((r) => !!r)
      .map((r) => resolveRights(...[].concat(r))),
    ...middlewares,
    main || (async (ctx) => {
      await Model.createFromCSV({
        model: Model, refs, datas: ctx.file,
      });
      ctx.log.info(`${Model.modelName} batch has been created`);
      ctx.status = 204;
    }),
  );
}

export function addCreateToRouter(Model, {
  url = '/', right, rights = [], main, successCode = 200, middlewares = [],
} = {}) {
  if (!right) {
    throw new APIError(403, 'Right should be defined');
  }
  const autoGenId = !Model.schema.obj._id;
  this.post(
    url,
    ...[right]
      .concat(rights)
      .filter((r) => !!r)
      .map((r) => resolveRights(...[].concat(r))),
    maskOutput,
    ...middlewares,
    main || (async (ctx) => {
      const { request: { body } } = ctx;

      if (!autoGenId) {
        if (await Model.findById(body.id)) {
          ctx.log.error(`${Model.modelName} "${body.id}" already exists`);
          ctx.throw(
            409,
            ctx.translate(
              'mongoose.errors.AlreadyExists',
              { model: ctx.translate(`mongoose.models.${Model.modelName}`), id: body.id },
            ),
          );
        }

        Object.assign(body, { _id: body.id });
      }
      const document = await Model.create(body);
      ctx.status = successCode;

      if (successCode !== 204) {
        ctx.body = document;
      }
      ctx.log.info(`${Model.modelName} "${body.id}" has been created`);
    }),
  );
}

export function addListToRouter(Model, {
  url = '/', right, rights = [], main, filters = {}, middlewares = [], lean = true,
} = {}) {
  if (!right) {
    throw new APIError(403, 'Right should be defined');
  }

  this.get(
    url,
    ...[right]
      .concat(rights)
      .filter((r) => !!r)
      .map((r) => resolveRights(...[].concat(r))),
    maskOutput,
    initFilters,
    ...Object.keys(filters).map((k) => addFilter(k, filters[k])),
    ...middlewares,
    main || (async (ctx) => {
      const { offset, limit } = ctx.parseRangePagination(Model);
      const [total, data] = await Promise.all([
        Model.countDocuments(ctx.filters),
        lean ? Model.find(ctx.filters).skip(offset).limit(limit).lean()
          : Model.find(ctx.filters).skip(offset).limit(limit),
      ]);

      ctx.log.info(
        {
          filters: ctx.filters, offset, limit, total,
        },
        `Find query in ${Model.modelName}`,
      );

      ctx.setRangePagination(Model, {
        total, offset, count: data.length, limit,
      });
      ctx.body = data;
    }),
  );
}

export function addGetToRouter(Model, {
  paramId = 'id', url = `/:${paramId}`, right, rights = [], main, middlewares = [], preMiddlewares = [], lean = true,
} = {}) {
  this.get(
    url,
    ...preMiddlewares,
    ...[right]
      .concat(rights)
      .filter((r) => !!r)
      .map((r) => resolveRights(...[].concat(r))),
    maskOutput,
    ...middlewares,
    main || (async (ctx) => {
      const { params } = ctx;
      const id = params[paramId];
      try {
        if (lean) {
          ctx.body = await Model.findById(id).lean();
        } else {
          ctx.body = await Model.findById(id);
        }
        if (!ctx.body) {
          ctx.throw_and_log(404, `${Model.modelName} "${id}" not found`);
        }
        ctx.log.info(`Find ${Model.modelName} with "${id}"`);
      } catch (e) {
        ctx.throw_and_log(404, `${Model.modelName} "${id}" not found`);
      }
    }),
  );
}

export function addDeleteToRouter(Model, {
  paramId = 'id', url = `/:${paramId}`, right, rights = [], main, middlewares = [],
} = {}) {
  this.del(
    url,
    ...[right]
      .concat(rights)
      .filter((r) => !!r)
      .map((r) => resolveRights(...[].concat(r))),
    ...middlewares,
    main || (async (ctx) => {
      const { params } = ctx;
      const id = params[paramId];
      await Model.deleteOne({ _id: id });
      ctx.log.info(`${Model.modelName} "${id}" has been removed`);
      ctx.status = 204;
    }),
  );
}

export function addUpdateToRouter(Model, {
  paramId = 'id', url = `/:${paramId}`, right, rights = [], main, middlewares = [], preMiddlewares = [],
} = {}) {
  this.patch(
    url,
    ...preMiddlewares,
    ...[right]
      .concat(rights)
      .filter((r) => !!r)
      .map((r) => resolveRights(...[].concat(r))),
    maskOutput,
    ...middlewares,
    main || (async (ctx) => {
      const { request: { body }, params } = ctx;
      const id = params[paramId];
      const model = await Model.findById(id);

      model.set(body);
      ctx.body = await model.save();
      ctx.log.info(
        { body },
        `${Model.modelName} "${id}" has been modified`,
      );
    }),
  );
}

export default (Model, {
  router, create, list, get, delete: remove, update, batch,
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
  if (batch) {
    addBatchToRouter.call(routerInstance, Model, batch);
  }
  return routerInstance;
};
