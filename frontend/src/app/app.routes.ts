import { Routes } from '@angular/router';
import { authenticatedGuard } from './guards/authenticated.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [

  // --- Rutas públicas ---
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./routes/auth/pages/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./routes/auth/pages/register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'logout',
        loadComponent: () => import('./routes/auth/pages/logout/logout.page').then( m => m.LogoutPage)
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      }
    ]
  },


  // --- Rutas para usuarios autenticados ---
  {
    path: 'home',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./routes/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'books/:id',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./routes/book/book.page').then((m) => m.BookPage),
  },
  {
    path: 'publish-book',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./routes/publish-book/publish-book.page').then( m => m.PublishBookPage)
  },
  {
    path: 'my-books',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./routes/my-books/my-books.page').then( m => m.MyBooksPage)
  },
  {
    path: 'myreque-list',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./routes/myreque-list/myreque-list.page').then( m => m.MyrequeListPage)
  },
  {
    path: 'myreceived-list',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./routes/myreceived-list/myreceived-list.page').then( m => m.MyreceivedListPage)
  },
  {
    path: 'user-profile/:id',
    canActivate: [authenticatedGuard],
    loadComponent: () =>
      import('./routes/user-profile/user-profile.page').then((m) => m.UserProfilePage),
  },


  // --- Rutas protegidas (solo para administradores) ---
  {
    path: 'panel-admin',
    canActivate: [authenticatedGuard, adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./routes/protegida/protegida.page').then((m) => m.ProtegidaPage),
      },
      {
        path: 'view-books',
        loadComponent: () =>
          import('./routes/protegida/view-books/view-books.page').then((m) => m.ViewBooksPage),
      },
      {
        path: 'usuarios-listado',
        loadComponent: () => import('./routes/protegida/usuarios-listado/usuarios-listado.page').then((m) => m.UsuariosListadoPage)
      },
      {
        path: 'modify-user/:id',
        loadComponent: () => import('./routes/protegida/modify-user/modify-user.page').then((m) => m.ModifyUserPage)
      }
    ]
  },
];
