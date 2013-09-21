/* 
	spawn(generator)

	send(chan, object)

	yield take(chan)
	yield take(chan, time_to_wait)
	
	yield select([chan_0, chan_1, chan_2])
	yield select([chan_0, chan_1, chan_2], time_to_wait)

	yield sleep(time_to_sleep)
*/

var gens    = {}   // store generators and their status (timeout & watching)
  , storage = {}   //
  , waiting = {};  //

const TAKE        = 0;
const TAKE_WAIT   = 1;
const SELECT      = 2;
const SELECT_WAIT = 3;
const SLEEP       = 4;

/*
 * @handle_request: recursively handle request
 * may use loop for better performance later ...
 *
 * @gid:    generator's id
 * @result: yielded result from generator
 *			@result: { value: request, done: bool }
 *				@value: yielded or returned item
 *				@done:  false if generator "yield" 
 *				@done:  true  if generator "return"
 */
function handle_request(gid, result) {

	if (result.done) {
		delete gens[gid];
		return;
	}

	var request = result.value;

	switch (request.type) {
	
	case TAKE:
	case TAKE_WAIT:
	
		var chan = request.channel;

		if (storage[chan] != null && storage[chan].length > 0) {
			// ok to take
			handle_request(gid, gens[gid].gen.send(storage[chan].shift()));
			return;
		}

		// not ready
		if (waiting[chan] == null) {
			waiting[chan] = [];
		}
		waiting[chan].push(gid);

		gens[gid].status = request.type;

		if (request.type == TAKE_WAIT) {

			// need to wait
			gens[gid].timeout = setTimeout(function () {

				// clear watching item
				waiting[chan].splice(waiting[chan].indexOf(gid), 1);

				// wake up
				handle_request(gid, gens[gid].gen.next());

			}, request.time);
		}
		
		return;

	case SELECT:
	case SELECT_WAIT:

		var chans = request.channels;

		// check all channels
		for (var i = 0; i < chans.length; i++) {
			if (storage[chans[i]] != null && storage[chans[i]].length > 0) {
				handle_request(gid, gens[gid].gen.send(storage[chans[i]].shift()));
				return; // exit if found
			}
		};

		if (gens[gid].watching == null) {
			gens[gid].watching = [];
		}

		// set watcher
		for (var i = 0; i < chans.length; i++) {

			if (waiting[chans[i]] == null) {
				waiting[chans[i]] = [];
			}
			waiting[chans[i]].push(gid);

			// add channel to watching list
			gens[gid].watching.push(chans[i]);
		}

		gens[gid].status = request.type;

		if (request.type == SELECT_WAIT) {
		
			gens[gid].timeout = setTimeout(function () {
				
				// clear watching list
				for (var i = 0; i < gens[gid].watching.length; i++) {
					waiting[gens[gid].watching[i]].splice(waiting[gens[gid].watching[i]].indexOf(gid), 1);
				}

				// delete watching list
				delete gens[gid].watching;

				handle_request(gid, gens[gid].gen.next());
			
			}, request.time);
		}
		return;

	case SLEEP:

		setTimeout(function () {
			handle_request(gid, gens[gid].gen.next());
		}, request.time);
		return;

	default:
		throw new Error("Invalid request.");
	}

}

var gid_counter = 0; // used to generate unique generator id

/*
 * spawn() is used to create new active generator
 */
function spawn(generator) {

	var gid = gid_counter++;

	gens[gid] = { gen: generator }

	// run immediately and handle yielded result
	handle_request(gid, gens[gid].gen.next());

}

/*
 * send() is the trigger to active the idle generators
 */
function send(name, item) {

	if (waiting[name] == null || waiting[name].length == 0) {

		// no one is waiting
		if (storage[name] == null) {
			storage[name] = [];
		}
		storage[name].push(item);		
		return;
	}

	// some one is waiting
	var gid = waiting[name].shift();

	switch (gens[gid].status) {

	case TAKE_WAIT:
		
		// clear setTimeout
		clearTimeout(gens[gid].timeout);
		break;

	case SELECT_WAIT:
		
		// clear setTimeout
		clearTimeout(gens[gid].timeout);

		// don't break, continue to clear watching list
	case SELECT:
		if (gens[gid].watching == null) break;

		// clear watching list
		for (var i = 0; i < gens[gid].watching.length; i++) {
			waiting[gens[gid].watching[i]].splice(waiting[gens[gid].watching[i]].indexOf(gid), 1);
		}
		// delete watching list
		delete gens[gid].watching;
	}

	handle_request(gid, gens[gid].gen.send(item));

}

function take(channel, time) {
	if (time == null)
		return { type: TAKE, channel: channel};
	else
		return { type: TAKE_WAIT, channel: channel, time: time }
}

function select(channels, time) {
	if (time == null)
		return { type: SELECT, channels: channels };
	else
		return { type: SELECT_WAIT, channels: channels, time: time };
}

function sleep(time) {
	return { type: SLEEP, time: time };
}


module.exports = {
	spawn:  spawn,
	send:   send,
	take:   take,
	select: select,
	sleep:  sleep
};

