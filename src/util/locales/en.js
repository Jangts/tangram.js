/*!
 * tangram.js framework sugar compiled code
 *
 * Datetime: Tue, 24 Apr 2018 15:55:04 GMT
 */
;
// tangram.config({});
tangram.block([], function (pandora, global, imports, undefined) {
	var _ = pandora;
	var en = {
		days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
		today: "today",
		suffix: [],
		meridiem: []
	};
	_.locales('times', {
		'en': en,
		'en-GB': en,
		'en-UK': en,
		'en-US': en
	});
});