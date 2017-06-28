import { Demand } from './Demand';

describe('DemandClass', () => {

    it('should create', () => {

        const demand = new Demand('audio');

        expect(demand.converted()).toEqual(null);
    });
});
