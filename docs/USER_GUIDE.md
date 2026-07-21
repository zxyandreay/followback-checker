# User Guide

FollowBack Checker reads Instagram relationship files from Meta's official account export. It does not log in to Instagram, scrape profiles, or sync live account data.

## Export Your Instagram Data

Use Instagram or Meta Accounts Center to request a data export. Interface labels may vary by region and over time, but the export flow is usually under **Accounts Center** > **Your information and permissions** > **Export your information** or **Download your information**.

### Recommended Settings

| Setting | Recommended value | Why it matters |
| --- | --- | --- |
| Data to export | Followers and following | Keeps the ZIP smaller while including the required relationship files |
| Date range | All time | Helps Instagram include complete follower and following snapshots |
| Format | JSON | FollowBack Checker does not parse HTML exports |
| Media quality | Any option | Photos and videos are not used for relationship comparisons |

After Meta prepares the export, download the ZIP file. The files FollowBack Checker needs are usually under:

```text
connections/followers_and_following/
```

## Upload Options

The easiest path is to upload the official ZIP directly. The app searches recognized JSON filenames anywhere inside the ZIP, so the files do not have to be at one exact internal path.

You can also upload loose JSON files by multi-selecting:

- `following.json` or `following_*.json`
- every `followers_*.json` file in the export, such as `followers_1.json`, `followers_2.json`, and later shards when present

Use the original files from the export when possible. Renamed, edited, truncated, or copied JSON can be harder to classify and may fail to parse.

## Supported Files

| You can upload | Notes |
| --- | --- |
| Full Instagram export ZIP | Must contain the JSON relationship files recognized by the parser |
| `following.json` | Supported as a loose file or inside the ZIP |
| `following_*.json` | Supported as loose files or inside the ZIP |
| `followers_*.json` | Supported as loose files or inside the ZIP; Instagram commonly uses numbered shards |

The parser can classify some loose JSON files by structure, but original filenames are the most reliable. A bare `followers.json` filename is not matched by the current follower shard pattern.

Unsupported inputs include HTML-only exports, screenshots, manually typed lists, links to Instagram profiles, and files from unrelated Meta export sections.

## Results

After a successful upload, the app shows five result categories.

| Category | Meaning |
| --- | --- |
| Following | Every normalized username from your following export |
| Followers | Every normalized username from your followers export |
| Not Following Back | Accounts you follow that are not in your followers list |
| People You Don't Follow Back | Followers who are not in your following list |
| Mutuals | Accounts present in both lists |

Usernames are normalized to lowercase and deduplicated before comparison.

## Search and CSV Export

- Search applies only to the active result category.
- Matching is substring-based against normalized usernames.
- If a search for `@username` does not match, try searching without the leading `@`.
- CSV export includes only the currently active and visible filtered rows.
- The default CSV filename is `followback-checker-export.csv`.

## Troubleshooting

**The ZIP does not contain JSON files.**
Request a JSON export. HTML-only exports are not supported.

**No follower/following JSON was found.**
Make sure the export includes **Followers and following** and that you uploaded the original Instagram export ZIP or the relationship JSON files.

**The app cannot find following files.**
Upload `following.json` or `following_*.json` from the export.

**The app cannot find follower files.**
Upload every `followers_*.json` shard from the export. Uploading only `following.json` is not enough.

**The comparison looks incomplete.**
Check that the export used **All time** as the date range and that all follower shards were uploaded.

**The JSON could not be parsed.**
Use a fresh official export. Hand-edited or partially downloaded files may be invalid.

**Large exports feel slow.**
Parsing runs in browser memory. Performance depends on export size, available memory, and browser/device speed.

## Privacy Notes

FollowBack Checker reads selected files in the browser and does not upload them to a project backend. Results are not saved between page refreshes. Treat Instagram exports as sensitive personal data and avoid committing or sharing them.
