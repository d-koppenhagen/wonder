import { Demand } from './Demand';
import { IDemand } from './interfaces/demand.interface';

describe('DemandClass', () => {
    const expectedAllTrue = {
      in:  { audio: true, video: true, data: true },
      out: { audio: true, video: true, data: true }
    };

    it('should return a demand object with all properties set to true by hand over nothing', () => {
        const demand = new Demand();
        expect(demand.converted()).toEqual(expectedAllTrue);
    });
    it('should return a demand object with all properties set to true by hand over an empty string', () => {
        const demand = new Demand('');
        expect(demand.converted()).toEqual(expectedAllTrue);
    });
    it('should return a demand object with all properties set to true by hand over the string \'all\'', () => {
        const demand = new Demand('all');
        expect(demand.converted()).toEqual(expectedAllTrue);
    });

    it('should return a demand object with audio properties set to true by hand over the string \'audio\'', () => {
        const demand = new Demand('audio');
        expect(demand.converted()).toEqual({
          in:  { audio: true, video: false, data: false },
          out: { audio: true, video: false, data: false }
        });
    });
    it('should return a demand object with video properties set to true by hand over the string \'video\'', () => {
        const demand = new Demand('video');
        expect(demand.converted()).toEqual({
          in:  { audio: false, video: true, data: false },
          out: { audio: false, video: true, data: false }
        });
    });
    it('should return a demand object with data properties set to true by hand over the string \'data\'', () => {
        const demand = new Demand('data');
        expect(demand.converted()).toEqual({
          in:  { audio: false, video: false, data: true },
          out: { audio: false, video: false, data: true }
        });
    });
    it('should return a demand object with all properties set to false by hand over a non valid string', () => {
        const demand = new Demand('something');
        expect(demand.converted()).toEqual({
          in:  { audio: false, video: false, data: false },
          out: { audio: false, video: false, data: false }
        });
    });
});
