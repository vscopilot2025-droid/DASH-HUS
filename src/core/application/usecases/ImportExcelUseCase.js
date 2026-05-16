export class ImportExcelUseCase {
  constructor(indicatorRepository, excelParser) {
    this.indicatorRepository = indicatorRepository;
    this.excelParser = excelParser;
  }

  async execute(file) {
    const indicators = await this.excelParser.parse(file);

    if (!indicators.length) {
      throw new Error("El archivo no contiene registros validos de indicadores.");
    }

    this.indicatorRepository.replaceAll(indicators);
    return indicators.length;
  }
}
