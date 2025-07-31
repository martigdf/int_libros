import { query } from "../services/database.js";
import bcrypt from 'bcryptjs';
import { UserType, UserPutType, UserPostType } from '../schemas/user/userSchema.js';

export class UserRepository {
  // Obtener un usuario por ID
  async getUserById(id: number): Promise<UserType | null> {
    const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    return rows[0] as UserType || null;
  }

  // Actualizar usuario (acepta campos dinámicos)
  async updateUser(id: number, data: Partial<UserPutType>): Promise<boolean> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const fields = Object.keys(data);
    if (fields.length === 0) return false;

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = Object.values(data);

    const { rowCount } = await query(
      `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`,
      [...values, id]
    );

    return (rowCount ?? 0) > 0;
  }

  // Obtener todos los usuarios
  async getAllUsers(): Promise<UserType[]> {
    const { rows } = await query(`SELECT * FROM users`);
    return rows as UserType[];
  }

  // Solicitudes enviadas por usuario
  async getSentRequests(userId: number): Promise<any[]> {
    const { rows } = await query(
      `SELECT * FROM requests WHERE requester_user_id = $1`,
      [userId]
    );
    return rows;
  }

  // Solicitudes recibidas por usuario
  async getReceivedRequests(userId: number): Promise<any[]> {
    const { rows } = await query(
      `SELECT * FROM requests WHERE receiver_user_id = $1`,
      [userId]
    );
    return rows;
  }

  // Crear usuario
  async createUser(data: {
    name: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    role: string;
  }): Promise<UserPostType> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { rows } = await query(
      `INSERT INTO users (name, lastname, username, email, password, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, lastname, username, email, role`,
      [data.name, data.lastname, data.username, data.email, hashedPassword, data.role]
    );
    return rows[0] as UserPostType;
  }
}

export const userRepository = new UserRepository();
