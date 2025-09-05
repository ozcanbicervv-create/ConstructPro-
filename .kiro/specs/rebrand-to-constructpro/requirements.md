# Requirements Document

## Introduction

This feature involves completely rebranding the existing chat.z.ai project to remove all references to Z.ai and replace them with Vovelet-Tech company branding and ConstructPro project naming. The goal is to transform this from a generic AI scaffold into a construction industry-focused application for the Vovelet-Tech company.

## Requirements

### Requirement 1

**User Story:** As a developer at Vovelet-Tech, I want all Z.ai branding removed from the project, so that the codebase reflects our company's identity instead of the original scaffold provider.

#### Acceptance Criteria

1. WHEN reviewing the README.md file THEN the system SHALL contain no references to Z.ai, chat.z.ai, or AI scaffold branding
2. WHEN examining the package.json file THEN the system SHALL have a project name that reflects ConstructPro instead of the generic scaffold name
3. WHEN checking the layout.tsx metadata THEN the system SHALL contain Vovelet-Tech and ConstructPro branding instead of Z.ai references
4. WHEN inspecting all source files THEN the system SHALL contain no remaining Z.ai URLs, titles, or descriptions

### Requirement 2

**User Story:** As a developer at Vovelet-Tech, I want the project to be branded as ConstructPro, so that it clearly identifies as our construction industry application.

#### Acceptance Criteria

1. WHEN viewing the application title THEN the system SHALL display "ConstructPro" as the main project name
2. WHEN examining metadata THEN the system SHALL reference Vovelet-Tech as the company/author
3. WHEN reading project descriptions THEN the system SHALL describe ConstructPro as a construction industry application
4. WHEN checking OpenGraph and social media metadata THEN the system SHALL use ConstructPro branding

### Requirement 3

**User Story:** As a developer at Vovelet-Tech, I want unnecessary dependencies removed, so that the project only contains packages relevant to our ConstructPro application.

#### Acceptance Criteria

1. WHEN reviewing package.json dependencies THEN the system SHALL NOT contain z-ai-web-dev-sdk package
2. WHEN examining the dependency list THEN the system SHALL only include packages necessary for ConstructPro functionality
3. WHEN running npm install THEN the system SHALL NOT attempt to install Z.ai specific packages

### Requirement 4

**User Story:** As a developer at Vovelet-Tech, I want the README to reflect ConstructPro's purpose, so that new team members understand this is a construction industry application.

#### Acceptance Criteria

1. WHEN reading the README title THEN the system SHALL display "ConstructPro - Construction Project Management"
2. WHEN reviewing the README description THEN the system SHALL describe construction industry features and capabilities
3. WHEN examining the technology stack section THEN the system SHALL focus on how the stack serves construction project management needs
4. WHEN reading getting started instructions THEN the system SHALL be specific to ConstructPro setup and usage