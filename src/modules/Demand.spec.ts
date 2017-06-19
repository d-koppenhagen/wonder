import { Demand } from './demand';

describe('DemandClass', () => {

    it('should create', () => {

        const demand = new Demand('audio');

        expect(demand.converted()).toEqual('Hello world!');
    });
});
