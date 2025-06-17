# 🔧 DevToolbox - All-in-One Developer Utility Hub
![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT--Commons%20Clause-orange.svg)

DevToolbox is a comprehensive, free, and open-source collection of essential developer utilities. Designed to streamline common tasks and boost productivity, it offers a fast, responsive, and user-friendly experience right in your browser.

**Live at: [devtoolbox.icu](https://devtoolbox.icu)**

## Inspiration

As a network engineer, I frequently rely on online tools for tasks like viewing certificates, exploring JSON structures, and converting text formats. While many excellent websites exist, I've often felt a degree of uncertainty about the security of my data when using third-party services. Additionally, some tools I've used appear to be less actively maintained.

This inspired the idea to build a personal toolbox – a collection of utilities where I have full control over the data and the development process. DevToolbox is the result of this endeavor, built with transparency and user confidence in mind.

### Limiting belives

It's worth noting that a significant portion of this project (approximately 99.5%) was generated using AI-assisted coding (Vibe-Coding) using Firebase-Studio. While this accelerated development, there may be some initial bugs or areas for improvement. As a humble network engineer transitioning into development, I appreciate any feedback and contributions to refine the project.

## ✨ Core Features & Available Tools

DevToolbox offers a diverse range of tools categorized for easy navigation:

### Development Tools (`/dev-tools`)

- **Base64 Encoder / Decoder:** Encode text to Base64 or decode Base64 strings.
- **Certificate Viewer:** Inspect PEM-encoded X.509 certificate details.
- **Color Converter:** Convert seamlessly between HEX, RGB, and HSL formats.
- **cURL Command Generator:** Easily construct cURL commands with a guided interface.
- **Hash Generator:** Generate SHA hashes (SHA-1, SHA-256, SHA-384, SHA-512).
- **Hex to Binary Converter:** Convert hexadecimal values to binary.
- **Icon Browser:** Browse and search Lucide React icons.
- **JWT Decoder:** Decode JWTs to inspect header and payload (signature not verified).
- **Password Strength Meter:** Analyze password strength and get suggestions.
- **QR Code Generator:** Generate QR codes for various data types.
- **Random String Generator:** Generate customizable random strings.
- **Secure Password Generator:** Create strong, random passwords.
- **Time Converter:** Convert timestamps between various formats.
- **URL Encoder / Decoder:** Encode or decode URL-safe strings.
- **UUID Generator:** Generate Version 4 UUIDs.

### Text Processing Tools (`/text-tools`)

- **Markdown Previewer:** Write Markdown text and see the rendered HTML in real-time.
- **Markdown to HTML Converter:** Convert Markdown text into raw HTML code.
- **Text Case Converter:** Convert text between various casing styles (camelCase, snake_case, PascalCase, etc.).
- **To One Liner:** Convert multi-line text or code snippets into a single continuous line.
- **Lorem Ipsum Generator:** Generate placeholder text in various styles (standard, DevOps, Startup).

**JSON Utilities:**

- **JSON Analyzer (`/json-analyzer`):** Validate, format, and inspect your JSON data.
- **JSON Diff (`/json-diff`):** Compare two JSON objects and visualize the differences.
- **JSON to Type Converter (`/json-to-type`):** Convert JSON structures into TypeScript or Go type definitions.
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

## 🛠️ Technology Stack

This project is built using a modern, efficient, and developer-friendly tech stack:

- **Next.js:** A React framework for building server-side rendered and statically generated web applications.
- **React:** A JavaScript library for building user interfaces.
- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A superset of JavaScript that adds static typing.
- **ShadCN UI:** A collection of beautifully designed, accessible, and customizable UI components.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Genkit (for AI features):** A toolkit for building AI-powered features (though primarily used for backend AI, it's part of the stack).
- **Lucide React:** A library of simply beautiful open-source icons.

## 🚀 Getting Started

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

## Deploy using Kamal

Kamal will push pull to your own Docker Repository. It builds the container, uploads it and your server will pull it.

Copy `.example-env` to `.env` and change it values

`kamal setup` for inital setup of the container
or
`kamal deploy` if you are updating

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
- `public/`: Static assets that are served directly.

## Contributing

Contributions are welcome! If you have ideas for new tools, improvements, or bug fixes, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License with Commons Clause](LICENSE.md) – non-commercial use only.

You are free to use, modify, and self-host this software for personal or internal (non-commercial) purposes.  
Commercial use – including selling, sublicensing, or offering the software as a paid service – is strictly prohibited without prior written permission from the author.
