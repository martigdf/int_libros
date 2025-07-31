import { query } from "../services/database.js";

export class RequestRepository {
  
  static createRequest(senderId: number, receiverId: number, books: number[]): Promise<{ id_request: number }> {
    return query(`
      WITH new_req AS (
        INSERT INTO requests (creation_date, state, sender_user_id, receiver_user_id)
        VALUES (CURRENT_TIMESTAMP, 'pending', $1, $2)
        RETURNING id
      )
      INSERT INTO requests_books (id_request, id_book)
      SELECT id, unnest($3::int[]) FROM new_req
      RETURNING id_request;
    `, [senderId, receiverId, books])
    .then(res => res.rows[0]);
  }

  static getSentRequests(userId: number): Promise<any[]> {
    return query(`
      WITH req AS (
        SELECT r.*, u.name AS receiver_name
        FROM requests r
        JOIN users u ON u.id = r.receiver_user_id
        WHERE r.sender_user_id = $1
      )
      SELECT req.*, json_agg(b.name) AS books
      FROM req
      JOIN requests_books rb ON rb.id_request = req.id
      JOIN books b ON b.id = rb.id_book
      GROUP BY 1,2,3,4,5,6
      ORDER BY req.creation_date DESC;
    `, [userId]).then(res => res.rows);
  }

  static getReceivedRequests(userId: number): Promise<any[]> {
    return query(`
      SELECT 
        r.id, r.creation_date, r.state, r.sender_user_id, r.receiver_user_id,
        u.name AS sender_name,
        json_agg(b.name) AS books
      FROM requests r
      JOIN users u ON u.id = r.sender_user_id
      JOIN requests_books rb ON rb.id_request = r.id
      JOIN books b ON b.id = rb.id_book
      WHERE r.receiver_user_id = $1
      GROUP BY 1,2,3,4,5,6
      ORDER BY r.creation_date DESC;
    `, [userId]).then(res => res.rows);
  }

  static respondRequest(id: number, state: string, receiverId: number): Promise<any> {
    return query(`
      WITH updated AS (
        UPDATE requests
        SET state = $1
        WHERE id = $2 AND receiver_user_id = $3 AND state = 'pending'
        RETURNING id
      )
      SELECT * FROM updated;
    `, [state, id, receiverId]);
  }
}
