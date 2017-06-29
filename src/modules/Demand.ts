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
  private _defaultDemand: IDemand = {
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

  constructor(data?: string | Array<String> | Object) {
    this._converted = this._convertDemand(data);
  }

  converted(): IDemand {
    console.log(`[Demand] converted: ${this._converted}`);
    return this._converted;
  }

  private _convertDemand(data: string | Array<string> | Object): IDemand {

    // case data is a string
    if (typeof data === 'string') {
      if (data === '' || data === 'all') {
        return this._demandAll();
      } else {
        return this._stringToDemand(data, this._defaultDemand);
      }
    } else if (data instanceof Array) { // case data is an array of Strings
      if (data.length === 0) {
        return this._demandAll();
      } else {
        return this._arrayToDemand(data, this._defaultDemand);
      }
    } else if (data instanceof Object) { // case data is an Object
      if (data === null || data === undefined || Object.keys(data).length === 0) {
        return this._demandAll();
      } else {
        return this._objectToDemand(data, this._defaultDemand);
      }
    } else {
      return this._demandAll();
    }

  }

  private _stringToDemand(stringData: string, dem: IDemand): IDemand {
    if (dem.in.hasOwnProperty(stringData) && dem.out.hasOwnProperty(stringData)) {
      dem.in[stringData] = true;
      dem.out[stringData] = true;
    }
    return dem;
  }

  private _arrayToDemand(arrayData: Array<string>, dem: IDemand): IDemand {
    for (let i = 0; i < arrayData.length; i++) {
      if (dem.in.hasOwnProperty(arrayData[i]) && dem.out.hasOwnProperty(arrayData[i])) {
        dem.in[arrayData[i]] = true;
        dem.out[arrayData[i]] = true;
      }
    }
    return dem;
  }

  private _objectToDemand(objectData: Object, dem: IDemand): IDemand {
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
      for (const prop in this._defaultDemand.in) {
        if (objectData.hasOwnProperty(prop)) {
          if (objectData[prop] === true || objectData[prop] === false || objectData[prop] instanceof Object) {
            this._defaultDemand.in[prop] = objectData[prop];
            this._defaultDemand.out[prop] = objectData[prop];
          } else {
            if (typeof objectData[prop] === 'string' || objectData[prop] instanceof String) {// { data: 'plain' }
              this._defaultDemand.in[prop] = objectData[prop]; // {in: {data : 'plain'}}
              this._defaultDemand.out[prop] = objectData[prop]; // {in: {data : 'plain'}}
            } else {
              this._defaultDemand.in[prop] = false;
              this._defaultDemand.out[prop] = false;
            }
          }
        }
      }
    }
    return dem;
  }

  private _demandAll(): IDemand {
    return {
      in: {
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

  updateDemandAllow(targetDemand: IDemand, additionalDemand: IDemand): IDemand {
    targetDemand = this._convertDemand(targetDemand);
    additionalDemand = this._convertDemand(additionalDemand);

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
    targetDemand = this._convertDemand(targetDemand);
    restrictiveDemand = this._convertDemand(restrictiveDemand);

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
