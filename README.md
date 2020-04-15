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
                type: 'containsWord',
                field: 'content',
                word: 'fuck',
            },
            {
                type: 'matchesRegexp',
                field: 'content',
                pattern: 'i like (trains|cars)',
                flags: '',
            },
            {
                type: 'multiple',
                op: 'and',
                children: [
                    {
                        type: 'containsText',
                        field: 'filename',
                        text: 'SPOILER',
                    },
                    {
                        type: 'matchesRegexp',
                        field: 'filename',
                        pattern: '\\.(png|jpe?g|gif)$',
                        flags: 'i',
                    },
                ],
            },
        ],
    },
}
```

which would be logically equivalent to (content contains "fuck") or (content matches `/i like (trains|cars)/`) or ((attachment filename contains "SPOILER") and (attachment filename matches `/\.(png|jpe?g|gif)$/i`))

filter UI similar to iTunes smart playlist thing

would merge word filters and extension filters

kinda like reddit automod but better

also restrictions based on channel, channel category, username, etc

sorta implemented but needs testing bc it's not hooked up to anything at all lol

## Reminders

make bernas happy

have the reminder get sent in whatever channel it was requested in e.g. support DMs

reminders collection: 

```js
{
    userID: 'whatever',
    channelID: 'whatever',
    requested: 12400923784,
    due: 1269834950,
    text: 'dab on the haters',
}
```
