var kangaBaseNode = require('../common/kanga-base-node');
var extend = require('../../utils/kanga-common').extend;
var KANGA_EVENT = require('../../constants/kanga-event-type');

function FirstTick(params) {
    kangaBaseNode.call(this, params);
    this.currentBucketSize = 0;
    this.sampledData = null;
    this.bucketUnit = params.bucket_unit;
    this.dataType = params.event_type;
    this.bucketSize = params.bucket_size;
}

extend(FirstTick, kangaBaseNode);

function handleDataTuple(){
    this.currentBucketSize += 1;
    if (this.currentBucketSize === 1) {
        this.sampledData = this.event;
    }
    if (this.bucketUnit === 'TICK') {
        if (this.currentBucketSize >= this.bucketSize) {
            return true;
        }
    }
    return false;
}

FirstTick.prototype._execute = function() {
    var output = null;
    switch (this.eventType) {
        case KANGA_EVENT.DATA:
        case KANGA_EVENT.COLLECTION:
            if (handleDataTuple.call(this)) {
                output = this.sampledData;
            }
            break;
        case KANGA_EVENT.TIME_TICK:
            output = this.sampledData;
            break;
        case KANGA_EVENT.EOF:
        case KANGA_EVENT.SYSTEM_LOG:
            return this.event;
        default:
            return null;
    }
    if (null !== output) {
        this.currentBucketSize = 0;
        if (this.dataType === 'EVENT') {
            this.sampledData = null;
        }
    }
    return output;
};

module.exports = FirstTick;