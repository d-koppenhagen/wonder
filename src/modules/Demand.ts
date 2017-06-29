import { IDemand } from './interfaces';

export class Demand {
  /**
   * @example
   * var demand = new Demand('all'); // demand video, audio and a data channel
   * var demand = new Demand('audio'); // demands audio for both directions
   * var demand = new Demand('noRealTypeLikeVideoOrAudioOrData'); // demands nothing
   * var demand = new Demand(['audio','data']); // demands audio and data for both directions
   * var demand = new Demand({in: 'video', out: 'audio'}); // demands incoming video and outgoing audio
   * var demand = new Demand({out:{data:true,video:false}}}); // demands only an outgoing data channel
   */
  defaultDemand: IDemand = {
    in: {
      audio: false,
      video: false,
      data: false
    },
    out: {
      audio: false,
      video: false,
      data: false
    }
  };

  private _converted: IDemand = null;

  public converted(): IDemand {
    return this._converted;
  }

  constructor(data?: string|Array<String>|Object) {
    this._converted = this.convertDemand(data, this.defaultDemand);
  }

  convertDemand(data: string|Array<string>|Object, demand: IDemand): IDemand {

    // case data is a string
    if (data instanceof String) {
      if (data === '' || data === 'all') {
        return demandAll();
      } else {
        return stringToDemand(data, demand);
      }
    } else if (data instanceof Array) { // case data is an array of Strings
      if (data.length === 0) {
        return demandAll();
      } else {
        return arrayToDemand(data, demand);
      }
    } else if (data instanceof Object) { // case data is an Object
      if (data === null || data === undefined || Object.keys(data).length === 0) {
        return demandAll();
      } else {
        return objectToDemand(data, demand);
      }
    } else {
      return demandAll();
    }

    function stringToDemand(stringData: string, dem: IDemand): IDemand {
      console.log('[Demand convertDemand] converting String:', stringData, 'to Demand ', demand);

      if (dem.in.hasOwnProperty(stringData) && dem.out.hasOwnProperty(stringData)) {
        dem.in[stringData] = true;
        dem.out[stringData] = true;
      }
      return dem;
    }

    function arrayToDemand(arrayData: Array<string>, dem: IDemand): IDemand {
      console.log('[Demand convertDemand] converting Array:', arrayData, 'to Demand');

      for (let i = 0; i < arrayData.length; i++) {
        if (dem.in.hasOwnProperty(arrayData[i]) && dem.out.hasOwnProperty(arrayData[i])) {
          dem.in[arrayData[i]] = true;
          dem.out[arrayData[i]] = true;
        }
      }
      return dem;
    }

    function objectToDemand(objectData: Object, dem: IDemand): IDemand {
      console.log('[Demand convertDemand] converting Object:', objectData, 'to Demand');

      // if already has the sub-objects 'in' and 'out'
      if (objectData.hasOwnProperty('in') || objectData.hasOwnProperty('out')) {
        // iterate through 'in' and 'out'
        for (const direction in dem) {
          // iterate through demand types ('audio', 'video', 'data')
          if (objectData.hasOwnProperty(direction)) {
            for (const prop in dem[direction]) {
              if (objectData[direction].hasOwnProperty(prop)) {
                if (objectData[direction][prop] === true
                  || objectData[direction][prop] === false
                  || objectData[direction][prop] instanceof Object) {
                  dem[direction][prop] = objectData[direction][prop];
                } else {
                  if (prop === 'data') {
                    dem[direction][prop] = objectData[direction][prop]; // { data: 'chat' }
                  } else {
                    dem[direction][prop] = false;
                  }
                }
              }
            }
          }
        }
        // if 'in' and 'out' is not specified, set attributes for both directions
      } else {
        for (const prop in demand['in']) {
          if (data.hasOwnProperty(prop)) {
            if (data[prop] === true || data[prop] === false  || data[prop] instanceof Object) {
              demand['in'][prop] = data[prop];
              demand['out'][prop] = data[prop];
            } else {
              if (typeof data[prop] === 'string' || data[prop] instanceof String) {// { data: 'plain' }
                demand['in'][prop] = data[prop]; // {in: {data : 'plain'}}
                demand['out'][prop] = data[prop]; // {in: {data : 'plain'}}
              } else {
                demand['in'][prop] = false;
                demand['out'][prop] = false;
              }
            }
          }
        }
      }

      return dem;
    }

    function demandAll(): IDemand {
      console.log('[Demand convertDemand] Wrong format:', data, 'using backup: set all to true');

      return {
        in : {
          'audio': true,
          'video': true,
          'data': true
        },
        out: {
          'audio': true,
          'video': true,
          'data': true
        }
      };

    }
  }

  updateDemandAllow(targetDemand: IDemand, additionalDemand: IDemand): IDemand {
    targetDemand     = this.convertDemand(targetDemand    , this.defaultDemand);
    additionalDemand = this.convertDemand(additionalDemand, this.defaultDemand);

    // iterate through 'in' and 'out'
    for (const direction in targetDemand) {
      if (additionalDemand.hasOwnProperty(direction)) {
        // iterate through demand types ('audio', 'video', 'data')
        for (const prop in targetDemand[direction]) {
          // if the property is true in the additionalDemand then add it ti the targetDemand
          if (additionalDemand[direction][prop]) {
            targetDemand[direction][prop] = additionalDemand[direction][prop];
          }
        }
      }
    }
    return targetDemand;
  }

  updateDemandDisallow(targetDemand: IDemand, restrictiveDemand: IDemand): IDemand {
    targetDemand      = this.convertDemand(targetDemand     , this.defaultDemand);
    restrictiveDemand = this.convertDemand(restrictiveDemand, this.defaultDemand);

    // iterate through 'in' and 'out'
    for (const direction in targetDemand) {
      if (restrictiveDemand.hasOwnProperty(direction)) {
        // iterate through demand types ('audio', 'video', 'data')
        for (const prop in targetDemand[direction]) {
          // if the property is false in the restriction, then add it to the targetDemand
          if (restrictiveDemand[direction][prop]) {
            targetDemand[direction][prop] = false;
          }
        }
      }
    }
    return targetDemand;
  }


}
