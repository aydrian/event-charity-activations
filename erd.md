```mermaid
erDiagram

        source_type {
            FORM FORM
        }
    
  "users" {
    String id "🗝️"
    String email 
    String password_hash 
    String full_name 
    }
  

  "events" {
    String id "🗝️"
    String name 
    String slug 
    DateTime start_date 
    DateTime end_date 
    String location 
    String created_by 
    DateTime created_at 
    DateTime updated_at 
    }
  

  "charities" {
    String id "🗝️"
    String name 
    String slug 
    String description 
    String created_by 
    DateTime created_at 
    DateTime updated_at 
    }
  

  "charities_events" {
    String event_id 
    String charity_id 
    Decimal donation 
    String color 
    }
  

  "donations" {
    String id "🗝️"
    String event_id 
    String charity_id 
    SourceType source 
    Json source_meta "❓"
    DateTime created_at 
    }
  

  "leads" {
    String id "🗝️"
    String first_name 
    String last_name 
    String email 
    String company 
    String job_role 
    String marketo_id "❓"
    String donation_id 
    }
  
    "users" o{--}o "events" : "Events"
    "users" o{--}o "charities" : "Charities"
    "events" o|--|| "users" : "Creator"
    "events" o{--}o "charities_events" : "Charities"
    "events" o{--}o "donations" : "Donations"
    "charities" o|--|| "users" : "Creator"
    "charities" o{--}o "charities_events" : "Events"
    "charities" o{--}o "donations" : "Donations"
    "charities_events" o|--|| "events" : "Event"
    "charities_events" o|--|| "charities" : "Charity"
    "donations" o|--|| "SourceType" : "enum:source"
    "donations" o{--}o "leads" : "Lead"
    "donations" o|--|| "events" : "Event"
    "donations" o|--|| "charities" : "Charity"
    "leads" o|--|| "donations" : "Donation"
```
