import { WebRTCDemoPage } from './app.po';

describe('web-rtcdemo App', () => {
  let page: WebRTCDemoPage;

  beforeEach(() => {
    page = new WebRTCDemoPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
