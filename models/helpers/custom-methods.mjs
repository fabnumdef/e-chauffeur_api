import config from '../../services/config';

export function filtersWithin(after, before, f = {}) {
  const filters = f;
  filters.$or = [
    {
      start: {
        $lt: before,
      },
      end: {
        $gt: after,
      },
    },
  ];
  return filters;
}


export function findWithin(after, before, filters = {}, ...rest) {
  return this.find(
    this.filtersWithin(after, before, filters),
    ...rest,
  );
}

export function countDocumentsWithin(after, before, filters = {}, ...rest) {
  return this.countDocuments(
    this.filtersWithin(after, before, filters),
    ...rest,
  );
}

export function compareTokens(token) {
  return this.token && token && this.token === token;
}

export function getClientURL() {
  return `${config.get('user_website_url')}/${this.id}?token=${this.token}`;
}
