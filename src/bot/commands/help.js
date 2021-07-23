// Provides a list of executable commands and usage information for individual commands.

// TODO: custom help command
import {default as command, help} from 'yuuko/dist/commands/help';
command.help = help;
export default command;
