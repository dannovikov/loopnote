# Source code organization

The most common changes start from `editor/editor.js`, and the official program starting point is `/page.js`. Here's a breakdown of the project directory structure:


- `/page.js` is the entry point for this app. It defines the projectbar and the editor components, which sit side by side and take up the entire page. 

- `editor/` contains the bulk of the logic, such as to display the project, and to play back and edit its tracks. 

- `projectbar/` defines the project bar on the left, where users can change the project being edited. 

- `tracks/` defines what tracks look like and how they behave in response to user interactions. 

- `header/` displays the current project name on the top of the editor. 

- `playhead/` contains the logic for the sliding playhead as it moves across the editor when playing. 

- `playcontrolsarea/` defines and contains the play, rewind and fastforward buttons

- `newtrackbuttons` defines the logic for the new track options the user can choose from.

- `server` is a file that temporarily acts a server, to store project updates, until a real backend is created. 
