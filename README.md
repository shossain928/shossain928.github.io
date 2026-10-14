# Sorif Hossain: academic website

Plain HTML pages. 

## Visitor map (who visits from which country)

The About page (`index.html`) ends with a "Visitors from around the world" section: a world map
shaded by number of visitors, the total, the number of countries, and a ranked list of countries.
Everyone who opens the page can see it. Nothing needs to be set up: it starts counting as soon as
the site is pushed to GitHub.

How it works:

- `visitors.js` (loaded on every page) counts each visitor once, the first time they open any page.
  The country comes from the visitor's device time zone, so no location lookup is needed.
  Search-engine bots, and copies of the site opened from your own computer, are not counted.
- The counts are kept by Abacus (https://abacus.jasoncameron.dev), a free counting service that
  needs no account. It is not on the usual ad-blocker lists, so the map also works for visitors
  who use an ad blocker. (Most visitor widgets, such as ClustrMaps, RevolverMaps and Flag Counter,
  are blocked by them.)
- `visitor-map-data.js` holds the world map itself, so the map always shows, even if the counter
  can't be reached for a while.

Good to know:

- Counting starts from zero on the day the site goes live with these files.
- To start again from zero, change `NS = "shossain928.github.io"` near the top of `visitors.js`
  to any new name (letters, numbers, dots and dashes).
- Counts are public and kept by a free service, so treat them as a friendly indicator rather than
  exact analytics.
- Abacus deletes counters that nobody looks at for 6 months; every visit to the About page keeps them alive.
