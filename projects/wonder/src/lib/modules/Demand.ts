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
  private defaultDemand: IDemand = {
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

  private conv: IDemand = null;

  constructor(data?: string | string[] | {}) {
    this.conv = this.convertDemand(data);
  }

  get converted(): IDemand {
    console.log(`[Demand] converted: ${this.conv}`);
    return this.conv;
  }

  private convertDemand(data: string | string[] | {}): IDemand {

    // case data is a string
    if (typeof data === 'string') {
      if (data === '' || data === 'all') {
        return this.demandAll();
      } else {
        return this.stringToDemand(data, this.defaultDemand);
      }
    } else if (data instanceof Array) { // case data is an array of strings
      if (data.length === 0) {
        return this.demandAll();
      } else {
        return this.arrayToDemand(data, this.defaultDemand);
      }
    } else if (data instanceof Object) { // case data is an Object
      if (data === null || data === undefined || Object.keys(data).length === 0) {
        return this.demandAll();
      } else {
        return this.objectToDemand(data, this.defaultDemand);
      }
    } else {
      return this.demandAll();
    }

  }

  private stringToDemand(stringData: string, dem: IDemand): IDemand {
    if (dem.in.hasOwnProperty(stringData) && dem.out.hasOwnProperty(stringData)) {
      dem.in[stringData] = true;
      dem.out[stringData] = true;
    }
    return dem;
  }

  private arrayToDemand(arrayData: string[], dem: IDemand): IDemand {
    arrayData.forEach(data => {
      if (dem.in.hasOwnProperty(data) && dem.out.hasOwnProperty(data)) {
        dem.in[data] = true;
        dem.out[data] = true;
      }
    });
    return dem;
  }

  private objectToDemand(objectData: {}, dem: IDemand): IDemand {
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
      for (const prop in this.defaultDemand.in) {
        if (objectData.hasOwnProperty(prop)) {
          if (objectData[prop] === true || objectData[prop] === false || objectData[prop] instanceof Object) {
            this.defaultDemand.in[prop] = objectData[prop];
            this.defaultDemand.out[prop] = objectData[prop];
          } else {
            if (typeof objectData[prop] === 'string' || objectData[prop] instanceof String) {// { data: 'plain' }
              this.defaultDemand.in[prop] = objectData[prop]; // {in: {data : 'plain'}}
              this.defaultDemand.out[prop] = objectData[prop]; // {in: {data : 'plain'}}
            } else {
              this.defaultDemand.in[prop] = false;
              this.defaultDemand.out[prop] = false;
            }
          }
        }
      }
    }
    return dem;
  }

  private demandAll(): IDemand {
    return {
      in: {
        audio: true,
        video: true,
        data: true
      },
      out: {
        audio: true,
        video: true,
        data: true
      }
    };

  }

  updateDemandAllow(targetDemand: IDemand, additionalDemand: IDemand): IDemand {
    targetDemand = this.convertDemand(targetDemand);
    additionalDemand = this.convertDemand(additionalDemand);

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
    targetDemand = this.convertDemand(targetDemand);
    restrictiveDemand = this.convertDemand(restrictiveDemand);

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
