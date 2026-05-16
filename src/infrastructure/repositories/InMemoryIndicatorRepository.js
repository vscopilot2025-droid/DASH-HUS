import { IndicatorRepositoryPort } from "../../core/application/ports/IndicatorRepositoryPort.js";

export class InMemoryIndicatorRepository extends IndicatorRepositoryPort {
  constructor(initialIndicators = []) {
    super();
    this._indicators = [...initialIndicators];
  }

  getAll() {
    return [...this._indicators];
  }

  replaceAll(indicators) {
    this._indicators = [...indicators];
  }
}
