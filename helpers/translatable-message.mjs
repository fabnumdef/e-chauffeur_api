export default class TranslatableMessage {
  constructor(key, substitutions) {
    this.key = key;
    this.substitutions = substitutions;
  }

  toTranslationParameters() {
    return [this.key, this.substitutions];
  }
}
