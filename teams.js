// Global variables
let teams;

// Global functions
/*
window.removePlayer = function(teamNum, playerIndex) {
    const team = teamNum === 1 ? teams.team1 : teams.team2;
    const playerName = team.players[playerIndex].name;

    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: `سيتم حذف اللاعب ${playerName} من ${teamNum === 1 ? 'الفريق الأول' : 'الفريق الثاني'}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء',
        customClass: {
            popup: 'swal2-rtl'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            team.players.splice(playerIndex, 1);
            saveTeams(teams);
            updateTeamsDisplay();

            Toastify({
                text: `تم حذف ${playerName} بنجاح`,
                duration: 3000,
                gravity: "top",
                position: "left",
                style: {
                    background: "#dc3545",
                }
            }).showToast();
        }
    });
};*/

$(document).ready(function() {
    // Load existing teams data
    teams = loadTeams();
    updateTeamsDisplay();

    // Form validation
    (() => {
        'use strict';
        const forms = document.querySelectorAll('.needs-validation');
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    })();

    // Team 1 Form Submit
    $('#team1Form').on('submit', function(e) {
        e.preventDefault();
        const name = $('#team1PlayerName').val().trim();
        const age = parseInt($('#team1PlayerAge').val());
        
        if (name && age) {
            teams.team1.players.push({ name, age, played: false, points: 0 });
            saveTeams(teams);
            updateTeamsDisplay();
            this.reset();
            $(this).removeClass('was-validated');

            // Show success toast
            Toastify({
                text: `تم إضافة ${name} إلى الفريق الأول`,
                duration: 3000,
                gravity: "top",
                position: "left",
                style: {
                    background: "var(--success-color)",
                }
            }).showToast();
        }
    });

    // Team 2 Form Submit
    $('#team2Form').on('submit', function(e) {
        e.preventDefault();
        const name = $('#team2PlayerName').val().trim();
        const age = parseInt($('#team2PlayerAge').val());
        
        if (name && age) {
            teams.team2.players.push({ name, age, played: false, points: 0 });
            saveTeams(teams);
            updateTeamsDisplay();
            this.reset();
            $(this).removeClass('was-validated');

            // Show success toast
            Toastify({
                text: `تم إضافة ${name} إلى الفريق الثاني`,
                duration: 3000,
                gravity: "top",
                position: "left",
                style: {
                    background: "var(--success-color)",
                }
            }).showToast();
        }
    });

    // Remove player functionality with confirmation
    $(document).on('click', '.remove-player', function() {
        const teamId = $(this).data('team');
        const playerIndex = $(this).data('index');
        const playerName = teams[teamId].players[playerIndex].name;

        // Show confirmation dialog
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: `سيتم حذف اللاعب ${playerName} من ${teamId === 'team1' ? 'الفريق الأول' : 'الفريق الثاني'}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger-color)',
            cancelButtonColor: 'var(--secondary-color)',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            customClass: {
                popup: 'swal2-rtl'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                teams[teamId].players.splice(playerIndex, 1);
                saveTeams(teams);
                updateTeamsDisplay();

                // Show success toast
                Toastify({
                    text: `تم حذف ${playerName} بنجاح`,
                    duration: 3000,
                    gravity: "top",
                    position: "left",
                    style: {
                        background: "var(--danger-color)",
                    }
                }).showToast();
            }
        });
    });

    function updateTeamsDisplay() {
        $('#team1PlayersList').empty();
        teams.team1.players.forEach((player, index) => {
            $('#team1PlayersList').append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <span>${player.name} (${player.age} سنة)</span>
                        <span class="badge bg-primary rounded-pill me-2">النقاط: ${player.points}</span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning removePlayer"  data-team="team1" data-index="${index}">حذف</button>
                    </div>
                </li>
            `);
        });

        $('#team2PlayersList').empty();
        teams.team2.players.forEach((player, index) => {
            $('#team2PlayersList').append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <span>${player.name} (${player.age} سنة)</span>
                        <span class="badge bg-primary rounded-pill me-2">النقاط: ${player.points}</span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-warning removePlayer"  data-team="team2" data-index="${index}">حذف</button>
                    </div>
                </li>
            `);
        });
    }

    function loadTeams() {
        const savedTeams = localStorage.getItem('gameData');
        if (savedTeams) {
            return JSON.parse(savedTeams).teams;
        }
        return {
            team1: { players: [], score: 0 },
            team2: { players: [], score: 0 }
        };
    }

    function saveTeams(teams) {
        const gameData = {
            teams: teams,
            currentTeam: 'team1',
            currentPlayerIndex: 0
        };
        localStorage.setItem('gameData', JSON.stringify(gameData));
    }

    function removePlayer(teamId, playerIndex) {
        const team = teamId === 'team1' ? teams.team1 : teams.team2;
        const playerName = team.players[playerIndex].name;

        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: `سيتم حذف اللاعب ${playerName} من ${teamId === 'team1' ? 'الفريق الأول' : 'الفريق الثاني'}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger-color)',
            cancelButtonColor: 'var(--secondary-color)',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            customClass: {
                popup: 'swal2-rtl'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                team.players.splice(playerIndex, 1);
                saveTeams(teams);
                updateTeamsDisplay();   

                // Show success toast
                Toastify({
                    text: `تم حذف ${playerName} بنجاح`,
                    duration: 3000,
                    gravity: "top",
                    position: "left",
                    style: {
                        background: "var(--danger-color)",
                    }
                }).showToast();
            }
        });
    }

    $(document).on('click', '.removePlayer', function() {
        const teamId = $(this).data('team');
        const playerIndex = $(this).data('index');
        removePlayer(teamId, playerIndex);
    });
});
