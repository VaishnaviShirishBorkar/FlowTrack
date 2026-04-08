# FlowTrack ER Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id
        string name
        string email
        string password
        string role
        date createdAt
        date updatedAt
    }

    PROJECT {
        ObjectId _id
        string name
        string description
        ObjectId owner
        ObjectId[] members
        MemberRole[] memberRoles
        date startDate
        date endDate
        date createdAt
    }

    TASK {
        ObjectId _id
        string title
        string description
        ObjectId project
        string status
        string priority
        ObjectId assignee
        ObjectId assignedTo
        date dueDate
        date createdAt
    }

    COMMENT {
        ObjectId _id
        string text
        ObjectId task
        ObjectId user
        date createdAt
    }

    ACTIVITY {
        ObjectId _id
        string action
        ObjectId user
        ObjectId project
        string details
        date createdAt
    }

    NOTIFICATION {
        ObjectId _id
        ObjectId recipient
        string type
        string title
        string message
        ObjectId project
        ObjectId task
        boolean isRead
        date createdAt
    }

    USER ||--o{ PROJECT : owns
    USER }o--o{ PROJECT : member_of
    PROJECT ||--o{ TASK : has
    USER ||--o{ TASK : assigned_to
    TASK ||--o{ COMMENT : has
    USER ||--o{ COMMENT : writes
    USER ||--o{ ACTIVITY : performs
    PROJECT ||--o{ ACTIVITY : records
    USER ||--o{ NOTIFICATION : receives
    PROJECT ||--o{ NOTIFICATION : relates_to
    TASK ||--o{ NOTIFICATION : relates_to
```

## Notes

- `Project.owner` is the project creator.
- `Project.members` stores project members as `User` references.
- `Project.memberRoles` stores project-specific roles, so a user can be a leader in one project and a member in another.
- `Task.assignedTo` is the active assignee field used across controllers and UI.
- `Task.assignee` also exists in the schema, but appears redundant in the current implementation.
