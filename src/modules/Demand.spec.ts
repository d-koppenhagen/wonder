import { Demand } from './Demand';
import { IDemand } from './interfaces/demand.interface';

describe('DemandClass', () => {
    const expectedAllTrue = {
      in:  { audio: true, video: true, data: true },
      out: { audio: true, video: true, data: true }
    };

    /**
     * just calling the method converted()
     */
    it('should return a demand object with all properties set to true by hand over nothing', () => {
        const demand = new Demand();
        expect(demand.converted()).toEqual(expectedAllTrue);
    });

    /**
     * convert a string
     */
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

    /**
     * convert an array
     */
    it('should return a demand object with all properties set to true by hand over all valid strings as an array', () => {
        const demand = new Demand(['audio', 'video', 'data']);
        expect(demand.converted()).toEqual(expectedAllTrue);
    });
    it('should return a demand object where properties set to true which are represented by a valid string in the array', () => {
        const demand = new Demand(['audio', 'something', 'data']);
        expect(demand.converted()).toEqual({
          in:  { audio: true, video: false, data: true },
          out: { audio: true, video: false, data: true }
        });
    });
    it('should return a demand object where properties set to true which are member of the array', () => {
        const demand = new Demand(['video', 'data']);
        expect(demand.converted()).toEqual({
          in:  { audio: false, video: true, data: true },
          out: { audio: false, video: true, data: true }
        });
    });

    /**
     * convert an simple object
     */
    it('should return a demand object with all properties set to true by hand over an appropriate object', () => {
        const demand = new Demand({ audio: true, video: true, data: true });
        expect(demand.converted()).toEqual(expectedAllTrue);
    });
    it('should return a demand object with all properties set to false by hand over an appropriate object', () => {
        const demand = new Demand({ audio: false, video: false, data: false });
        expect(demand.converted()).toEqual({
          in:  { audio: false, video: false, data: false },
          out: { audio: false, video: false, data: false }
        });
    });
    it('should return a demand object where only properties set to true which are specified by the object', () => {
        const demand = new Demand({ audio: true, video: false, data: true });
        expect(demand.converted()).toEqual({
          in:  { audio: true, video: false, data: true },
          out: { audio: true, video: false, data: true }
        });
    });
    it('should return a demand object where only invalid or not set properties will be ignored', () => {
        const demand = new Demand({ something: true, data: true });
        expect(demand.converted()).toEqual({
          in:  { audio: false, video: false, data: true },
          out: { audio: false, video: false, data: true }
        });
    });

    /**
     * convert objects with different directions for in and out
     */
    it('should return a demand object with all properties set to true by hand over an appropriate object', () => {
        const demand = new Demand(expectedAllTrue);
        expect(demand.converted()).toEqual(expectedAllTrue);
    });
    it('should return a demand object with all properties set to true by hand over an appropriate object', () => {
        const obj = {
          in:  { audio: false, video: false, data: false },
          out: { audio: false, video: false, data: false }
        };
        const demand = new Demand(obj);
        expect(demand.converted()).toEqual(obj);
    });
    it('should return a demand object where only invalid or not set properties will be ignored', () => {
        let demand = new Demand({
          in: { something: true, data: true, video: true, audio: false }
        });
        expect(demand.converted()).toEqual({
          in:  { audio: false, video: true, data: true },
          out: { audio: false, video: false, data: false }
        });

        demand = new Demand({
          in: { something: true, data: false, video: true, audio: true },
          out: { video: false, data: true }
        });
        expect(demand.converted()).toEqual({
          in:  { audio: true, video: true, data: false },
          out: { audio: false, video: false, data: true }
        });
    });

});
