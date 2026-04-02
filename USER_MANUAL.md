# 🏆 Football League Management - User Manual

Welcome to the **Football League Management System**. This guide outlines the features and workflows available for each role: **Admin**, **Manager**, and **Player**.

---

## 🛡️ Role: Administrator (Admin)
The Admin is responsible for the entire lifecycle of a league, from creation to archiving.

### 1. League Lifecycle Management
*   **Create League**: Set the league name, season, description, and capacity (Max Teams).
*   **Recruitment Phase**: Leaguas start in the `REGISTRATION` status. Admnins can see the progress of total applicants vs. confirmed squads.
*   **Phase Transition**: Once a league is full, the Admin can close registration to move into `PRE-SEASON`.

### 2. Pre-Season Preparation
*   **Fixtures Generation**: Generate a full schedule (Single or Double Round-Robin) based on confirmed teams.
*   **Schedule Adjustment**: Modify match dates and times before the season starts.
*   **Start Season**: Officially activate the league to move it to `ONGOING`.

### 3. Match Management (Live Tools)
*   **Scorekeeping**: Log match events including **Goals**, **Assists**, **Yellow Cards**, and **Red Cards**.
*   **Timeline View**: A real-time timeline tracks every event with player names and minutes.
*   **Ending Matches**: Officially end a match to update the league standings and player statistics.

### 4. Archive & History
*   **Archiving**: Once all matches are played, the league is moved to `COMPLETED`.
*   **Read-Only Mode**: Completed leagues can be viewed for historical reference, but data editing is disabled to preserve record integrity.

---

## 👔 Role: Team Manager (Manager)
Managers lead their clubs through different seasons and competitions.

### 1. Club & Squad Setup
*   **Club Profile**: Manage your team's name and identity.
*   **Squad Management**: Add players to your roster, assign them jersey numbers, and set their primary positions.

### 2. League Discovery
*   **Joining a League**: Browse active recruitment phases and apply to join.
*   **Dashboard States**: 
    *   **Applied**: Track your application status while waiting for Admin approval.
    *   **In-Season**: View your next opponent, current league ranking, and top performers in your squad.
    *   **Season Summary**: When a league ends, see your final placement (e.g., "3rd Place") and quickly find a new competition to join.

### 3. Match Center
*   **Fixtures**: Stay updated on upcoming kickoff times.
*   **Results**: View a detailed history of your team's performance across all current and past seasons.

---

## 🏃 Role: Player
Players focus on their professional performance and team schedule.

### 1. Player Identity
*   **Onboarding**: Register as a "Pro Player" by setting your name, position, and profile.
*   **Team Association**: Once joined to a team, your stats will be tracked in every match you play.

### 2. Personal & Team Progress
*   **Match Center**: A unified view for players to see where and when the next battle takes place.
*   **Standings & Stats**: Monitor the league table and see how you rank among the top scorers or assist leaders.
*   **Historical Log**: Review your performance in past matches to improve for the next season.

---

## 📊 Shared Features
*   **Real-Time Standings**: Automatically calculated based on wins (3 pts), draws (1 pt), and losses (0 pts).
*   **Automatic Tie-Breakers**: Rankings are decided by Points > Goal Difference > Goals For.
*   **Goal Tracking**: Full assist and goal statistics for every player in the league.
