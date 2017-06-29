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

});
