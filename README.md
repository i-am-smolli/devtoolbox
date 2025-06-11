# DevToolbox - Essential Developer Utilities

DevToolbox is a comprehensive suite of free online developer tools designed to streamline common tasks and boost productivity. It's built with modern web technologies, offering a fast, responsive, and user-friendly experience.

## Inspiration

I commonly use tools like certificate viewer, JSON explorer and text converter for my daily job. There are a ton of great websites online, like https://www.devtoolbox.co/ -> https://github.com/YourAverageTechBro/DevToolboxWeb . I always was a bit spectial when I used such tools, because I was not sure if my data was secure or not. Also many of them seem not do be actively developed or maintained any more.

So I was vibe coding (firebase-studio) in my spare time the other day and had the idea to make my own toolbox. And here it is.

### Limiting belives

As mentioned, this project is mostly (99.5%) generated using AI. Im pretty sure there are some bugs. But Im just a humble network engineer, not a highly skilled TypeScript, Next.JS and shadcn ui developer.

## Features (Available Tools)

The DevToolbox provides a wide array of utilities, including:

**Development Tools (`/dev-tools`):**

- **Base64 Encoder / Decoder:** Encode text to Base64 or decode Base64 strings back to text.
- **Certificate Viewer:** Paste a PEM-encoded X.509 certificate to view its details, including subject, issuer, validity, extensions, and more.
- **Color Converter:** Convert colors seamlessly between HEX, RGB, and HSL formats.
- **cURL Command Generator:** Easily construct cURL commands with a guided interface.
- **Hash Generator:** Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512) from text.
- **Hex to Binary Converter:** Convert hexadecimal values to their binary representation.
- **Icon Browser:** Browse, search, and find Lucide React icons for your project.
- **JWT Decoder:** Decode JSON Web Tokens (JWTs) to inspect their header and payload (signature is not verified).
- **Password Strength Meter:** Analyze the strength of your password and get suggestions for improvement.
- **QR Code Generator:** Generate custom QR codes for various data types including text, URLs, WiFi credentials, SMS, email, and geographic locations.
- **Random String Generator:** Generate random strings with customizable length and character sets.
- **Secure Password Generator:** Create strong, random, and secure passwords.
- **Time Converter:** Convert timestamps between various formats (Unix, ISO 8601, Date, Time, HTTP, SQL).
- **URL Encoder / Decoder:** Encode strings to be URL-safe (percent-encoding) or decode URL-encoded strings.
- **UUID Generator:** Generate one or more Version 4 UUIDs.

**Text Processing Tools (`/text-tools`):**

- **Markdown Previewer:** Write Markdown text and see the rendered HTML in real-time.
- **Markdown to HTML Converter:** Convert Markdown text into raw HTML code.
- **Text Case Converter:** Convert text between various casing styles (camelCase, snake_case, PascalCase, etc.).
- **To One Liner:** Convert multi-line text or code snippets into a single continuous line.
- **Lorem Ipsum Generator:** Generate placeholder text in various styles (standard, DevOps, Startup).

**JSON Utilities:**

- **JSON Analyzer (`/json-analyzer`):** Validate, format, and inspect your JSON data.
- **JSON Explorer (`/json-explorer`):** Interactively navigate and explore complex JSON data structures in a collapsible tree view.

**DevOps Tools (`/devops-tools`):**

- **Cron Expression Builder:** Visually construct and generate cron expressions for scheduling tasks.
- **Cron Parser:** Parse cron expressions and see a human-readable interpretation of the schedule.
- **Dockerfile Linter:** Analyze Dockerfiles for common syntax errors, structural issues, and best practice recommendations.
- **.env File Parser & Viewer:** Paste `.env` file content to parse and view environment variables in a structured table.
- **YAML/JSON Converter:** Convert data seamlessly between YAML and JSON formats.

**Networking Tools (`/networking-tools`):**

- **CIDR Calculator & Subnet Visualizer:** Calculate network details from CIDR notation and visualize subnets.
- **URL Builder:** Construct well-formed URLs by specifying individual components.
- **URL Explorer:** Break down a URL into its constituent parts (protocol, hostname, path, query parameters, hash).

## Technology Stack

This project is built using a modern, efficient, and developer-friendly tech stack:

- **Next.js:** A React framework for building server-side rendered and statically generated web applications.
- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A superset of JavaScript that adds static typing.
- **ShadCN UI:** A collection of beautifully designed, accessible, and customizable UI components.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Genkit (for AI features):** A toolkit for building AI-powered features (though primarily used for backend AI, it's part of the stack).
- **Lucide React:** A library of simply beautiful open-source icons.

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- **Node.js:** Make sure you have Node.js installed (v18 or newer recommended). You can download it from [nodejs.org](https://nodejs.org/).
- **npm** (Node Package Manager) or **yarn:** These come bundled with Node.js or can be installed separately.

### Installation

1.  **Clone the repository (if you haven't already):**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

### Running the Development Server

To start the development server with hot-reloading:

```bash
npm run dev
```

This will typically start the application on `http://localhost:9002`. Open this URL in your browser to see the application.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This command compiles the application and outputs the production-ready files into the `.next` directory.

### Running in Production Mode

After building the project, you can start it in production mode:

```bash
npm start
```

This will serve the optimized version of your application, typically on `http://localhost:3000` (or the port configured for Next.js production starts).

### Genkit Development (for AI features)

If you are working on AI features powered by Genkit:

- To start the Genkit development flow runner:
  ```bash
  npm run genkit:dev
  ```
- To start the Genkit development flow runner with file watching:
  ```bash
  npm run genkit:watch
  ```

## Project Structure

A brief overview of the key directories:

- `src/app/`: Contains all the pages and layouts for the application, following the Next.js App Router conventions.
  - `src/app/(tool-categories)/[tool-name]/page.tsx`: Specific tool page components.
  - `src/app/(tool-categories)/[tool-name]/layout.tsx`: Layouts for specific tools, often used for metadata.
- `src/components/`: Reusable UI components.
  - `src/components/ui/`: ShadCN UI components.
  - `src/components/layout/`: Layout-specific components like the sidebar and main navigation.
- `src/lib/`: Utility functions and libraries.
- `src/hooks/`: Custom React hooks.
- `src/ai/`: Genkit related code for AI features.
- `public/`: Static assets that are served directly.

## Contributing

Contributions are welcome! If you have ideas for new tools, improvements, or bug fixes, please feel free to open an issue or submit a pull request. (This section can be expanded with more specific guidelines if needed).


## Deploy using Kamal

Copy ```.example-env``` to ```.env``` and change it values 

```kamal setup``` for inital setup of the container
or 
```kamal deploy``` if you are updating 

## Todo

## License

This project is licensed under the [MIT License](LICENSE.md) (Assuming MIT - if not, please specify or create a LICENSE.md file).
