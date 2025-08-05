class VersionService {
  private version: string;
  constructor() {
    this.version = '1.0.0';
  }
  init(version: string) {
    this.version = version;
  }
  getVersion() {
    return this.version;
  }
}

export default new VersionService();
