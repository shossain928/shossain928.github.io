# Sorif Hossain: academic website

Plain HTML pages. No Hugo, no build step, nothing to install.
Every file sits in ONE folder (no subfolders), so nothing gets lost on upload.

| File | What it is |
|---|---|
| index.html | About: photo, motto, biography, interests, education, selected publications, awards |
| publications.html | All papers with search, filters (topic, type, year) and a Cite button |
| presentations.html | Talks and posters |
| projects.html + projects.js | Current research, with the live SIR / R(t) / alarm-function figure |
| teaching.html | Courses |
| experience.html | Work experience |
| voluntary.html | Voluntary roles and peer review |
| CV.pdf | Your CV (the CV button in the top bar downloads it) |
| style.css, site.js | Design and shared behaviour |
| research.html, news.html, cv.html | Tiny redirects so links to the old pages still work |
| 404.html | Shown for broken links |

## Update the live site
1. Unzip (right-click, **Extract All**).
2. In your `shossain928.github.io` repository click **Add file, then Upload files**.
3. Select every file in the extracted folder (Ctrl+A), drag them in, and click **Commit changes**.
   Files with the same name are replaced automatically.
4. If an old `assets` folder is still in the repository, delete it.

## Your photo
Save a square photo as **profile.jpg** and upload it with the other files.
Until then the page uses your UCalgary profile photo.

## Updating content
- **New paper:** in publications.html copy one `<li class="pub" ...> ... </li>` block, paste it under the
  right year and edit the text and `data-...` values. Counts and filters update themselves.
  To feature it on the About page, copy the same block into the "Selected publications" list in index.html.
- **DOI:** put it in `data-doi="..."` and change the "Find paper" link to `https://doi.org/...` with the text DOI.
- **Search for `CHECK:`** in publications.html. Those comments mark entries where an author list,
  volume or DOI still needs filling in.
- **Award:** add an `<li class="award">` line in the Awards list in index.html.
- **Presentation:** copy an `<li>` in presentations.html.
- **Voluntary role / job:** copy an `<li class="tl">` in voluntary.html or experience.html.
- **New CV:** replace CV.pdf, keeping the same file name.
