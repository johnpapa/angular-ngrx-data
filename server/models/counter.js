const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const counterSchema = Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

function increment(entityId, entity, next) {
  Counter.findByIdAndUpdate(
    { _id: entityId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
    (error, count) => {
      if (error) {
        console.error('counter error-> : ' + error);
        return next(error);
      }
      console.log('...count: ' + JSON.stringify(count));
      entity.id = count.seq;
      next();
    }
  );
  // counter
  //   .findByIdAndUpdateAsync({ _id: 'heroes' }, { $inc: { seq: 1 } }, { new: true, upsert: true })
  //   .then(function(count) {
  //     console.log('...count: ' + JSON.stringify(count));
  //     doc.id = count.seq;
  //     next();
  //   })
  //   .catch(function(error) {
  //     console.error('counter error-> : ' + error);
  //     throw error;
  //   });
}

module.exports = {
  CounterModel: Counter,
  increment: increment
};
