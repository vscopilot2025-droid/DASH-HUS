export class GetIndicatorDetailUseCase {
  constructor(indicatorRepository) {
    this.indicatorRepository = indicatorRepository;
  }

  execute(indicatorId) {
    return this.indicatorRepository.getAll().find((item) => item.id === indicatorId) ?? null;
  }
}
