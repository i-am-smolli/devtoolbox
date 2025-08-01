# 🔧 DevToolbox 
[![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT--Commons%20Clause-orange.svg)](https://github.com/i-am-smolli/devtoolbox/blob/master/LICENSE.md)
[![CI](https://github.com/i-am-smolli/devtoolbox/actions/workflows/ci-pipeline.yml/badge.svg?branch=master)](https://github.com/i-am-smolli/devtoolbox/actions/workflows/ci-pipeline.yml)

A privacy-first collection of 30+ free and open-source developer utilities. All tools run directly in your browser—fast, responsive, and with zero server-side data processing.

**Try it live: [https://devtoolbox.icu](https://devtoolbox.icu)**

## ✨Tools at a Glance

DevToolbox offers a wide range of helpers, organized into the following categories:

| Development & Converters          | Text-Utilities                | JSON-Utilities                 |
| --------------------------------- | ----------------------------- | ------------------------------ |
| • Base64 Encoder/Decoder          | • Markdown Previewer          | • JSON Analyzer & Formatter    |
| • Certificate Viewer              | • Markdown to HTML            | • JSON Explorer                |
| • Color Converter                 | • Text Case Converter         |                                |
| • cURL Command Generator          | • To One Liner                |                                |
| • Hash Generator (SHA)            | • Lorem Ipsum Generator       |                                |
| • Hex to Binary                   |                               |                                |
| • JWT Decoder                     |                               |                                |
| • Password Strength Meter         |                               |                                |
| • QR Code Generator               |                               |                                |
| • Random String Generator         |                               |                                |
| • Secure Password Generator       |                               |                                |
| • Time Converter                  |                               |                                |
| • URL Encoder/Decoder             |                               |                                |
| • UUID v4 Generator               |                               |                                |
| • Lucide Icon Browser             |                               |                                |

| DevOps                            | Network                          |
| --------------------------------- | -------------------------------- |
| • Cron Expression Builder         | • CIDR Calculator & Visualizer   |
| • Cron Parser                     | • URL Builder                    |
| • Dockerfile Linter               | • URL Explorer                   |
| • `.env` File Parser              |                                  |
| • YAML <=> JSON Converter         |                                  |

---

## 🛠️ Technology Stack

* **Framework:** Next.js & React
* **Language:** TypeScript
* **UI:** ShadCN UI & Lucide Icons
* **Styling:** Tailwind CSS

## 🚀 Getting Started

To run this project locally, you will need Node.js (v18+).


### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/i-am-smolli/devtoolbox
    cd devtoolbox
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

### Start the Development Server

To start the development server with hot-reloading:

```bash
npm run dev
```

This will start the application on `http://localhost:9002`

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

This will serve the optimized version on `http://localhost:3000`

## Deploy using Kamal

Kamal will push pull to your own Docker Repository. It builds the container, uploads it and your server will pull it.

Copy `.example-env` to `.env` and change it values

`kamal setup` for inital setup of the container
or
`kamal deploy` if you are updating

## 🤝Contributing

Contributions are welcome! If you have ideas for new tools, improvements, or bug fixes, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License with Commons Clause](LICENSE.md) – non-commercial use only.

You are free to use, modify, and self-host this software for personal or internal corporate use. 
Commercial use — including selling, sublicensing, or offering the software as a paid service—is strictly prohibited without prior written permission.
