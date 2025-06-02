# MamaBear Integration Workbench

The Integration Workbench provides a unified interface for:
- Scraping knowledge from external websites
- Creating automation workflows
- Managing platform integrations
- Browsing your knowledge base

## Quick Start

1. Navigate to the Integration tab in the Podplay Sanctuary sidebar
2. Use the tabbed interface to access different functions:
   - **Scraper**: Extract knowledge from URLs
   - **Workflows**: Create automation workflows
   - **Platforms**: Connect to external services
   - **Knowledge**: Browse your knowledge base

## Features

### Knowledge Scraping

Scrape content from websites to add to MamaBear's knowledge base:

1. Enter a URL in the scraper input field
2. Click "Scrape" to extract content
3. Review the extracted content chunks
4. Content is automatically stored in MamaBear's memory

### Workflow Automation

Create powerful automation workflows using natural language:

1. Describe your workflow in plain English
2. MamaBear converts this to executable steps
3. Connect workflows to external platforms
4. Run workflows manually or trigger them automatically

### Platform Integrations

Connect to external platforms and services:

1. Browse available platforms
2. Authenticate with your credentials
3. Manage connections and permissions
4. Use connected platforms in your workflows

### Knowledge Base

Browse all knowledge sources available to MamaBear:

1. Search through stored knowledge
2. Filter by source, date, or topic
3. View detailed information about each knowledge chunk
4. Delete or update knowledge items

## API Endpoints

The Integration Workbench uses these backend endpoints:

- `POST /api/integration/scrape`: Scrape content from a URL
- `GET /api/integration/platforms`: List available integration platforms
- `POST /api/integration/workflow`: Create a new workflow
- `POST /api/integration/platform-auth`: Authenticate with a platform
- `GET /api/integration/knowledge`: List knowledge sources

## Troubleshooting

Common issues and solutions:

- **Scraping fails**: Ensure the URL is accessible and not behind a login
- **Platform authentication fails**: Check your credentials and try again
- **Workflow creation errors**: Use simpler natural language descriptions
- **Knowledge not appearing**: Refresh the knowledge tab

## Contributing

To extend the Integration Workbench:

1. Add new platform integrations in `backend/services/platforms/`
2. Enhance scraping capabilities in `backend/services/scraper.py`
3. Add new workflow templates in `backend/services/workflows/`
