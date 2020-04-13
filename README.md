# TODOs

## Opt-in channel automation

this will be a pain but i believe

## RSS feeds

ez money, config page that just lets you map an RSS feed URL to a Discord channel, maybe with some custom options/filters/etc

## filters

filter DB format:

```js
{
    guildID: 'whatever',
    rule: {
        type: 'multiple',
        op: 'or',
        children: [
            {
                type: 'contentMatchesWord',
                word: 'fuck',
            },
            {
                type: 'contentMatchesRegexp',
                pattern: 'i like (trains|cars)',
                flags: []
            },
            {
                type: 'multiple',
                op: 'and',
                children: [
                    {
                        type: 'attachmentFilenameContains',
                        text: 'SPOILER',
                    },
                    {
                        type: 'attachmentFilenameMatchesRegexp',
                        pattern: '\\.(png|jpe?g|gif)$',
                        flags: ['i']
                    }
                ]
            }
        ],
    },
}
```

which would be logically equivalent to (content contains "fuck") or (content matches `/i like (trains|cars)/`) or ((attachment filename contains "SPOILER") and (attachment filename matches `/\.(png|jpe?g|gif)$/i`))

filter UI similar to iTunes smart playlist thing

would merge word filters and extension filters

kinda like reddit automod but better

also restrictions based on channel, channel category, username, etc
