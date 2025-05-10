import { SettingsService } from "./setting.service";

class Service {
  settings: SettingsService;

  constructor() {
    this.settings = new SettingsService();
  }
}

const service = new Service();
export default service;
