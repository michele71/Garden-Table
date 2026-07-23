import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { GardenReservation, GardenReservationInput, GardenTokenInput, HealthStatus, ListGardenReservationsParams } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListGardenReservationsUrl: (params: ListGardenReservationsParams) => string;
/**
 * @summary List garden reservations for a week
 */
export declare const listGardenReservations: (params: ListGardenReservationsParams, options?: RequestInit) => Promise<GardenReservation[]>;
export declare const getListGardenReservationsQueryKey: (params?: ListGardenReservationsParams) => readonly ["/api/garden/reservations", ...ListGardenReservationsParams[]];
export declare const getListGardenReservationsQueryOptions: <TData = Awaited<ReturnType<typeof listGardenReservations>>, TError = ErrorType<unknown>>(params: ListGardenReservationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGardenReservations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listGardenReservations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListGardenReservationsQueryResult = NonNullable<Awaited<ReturnType<typeof listGardenReservations>>>;
export type ListGardenReservationsQueryError = ErrorType<unknown>;
/**
 * @summary List garden reservations for a week
 */
export declare function useListGardenReservations<TData = Awaited<ReturnType<typeof listGardenReservations>>, TError = ErrorType<unknown>>(params: ListGardenReservationsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listGardenReservations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateGardenReservationUrl: () => string;
/**
 * @summary Reserve the garden table for an evening
 */
export declare const createGardenReservation: (gardenReservationInput: GardenReservationInput, options?: RequestInit) => Promise<GardenReservation>;
export declare const getCreateGardenReservationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGardenReservation>>, TError, {
        data: BodyType<GardenReservationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createGardenReservation>>, TError, {
    data: BodyType<GardenReservationInput>;
}, TContext>;
export type CreateGardenReservationMutationResult = NonNullable<Awaited<ReturnType<typeof createGardenReservation>>>;
export type CreateGardenReservationMutationBody = BodyType<GardenReservationInput>;
export type CreateGardenReservationMutationError = ErrorType<void>;
/**
* @summary Reserve the garden table for an evening
*/
export declare const useCreateGardenReservation: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createGardenReservation>>, TError, {
        data: BodyType<GardenReservationInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createGardenReservation>>, TError, {
    data: BodyType<GardenReservationInput>;
}, TContext>;
export declare const getRegisterGardenTokenUrl: () => string;
/**
 * @summary Register or update a device push token for a flat
 */
export declare const registerGardenToken: (gardenTokenInput: GardenTokenInput, options?: RequestInit) => Promise<void>;
export declare const getRegisterGardenTokenMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerGardenToken>>, TError, {
        data: BodyType<GardenTokenInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof registerGardenToken>>, TError, {
    data: BodyType<GardenTokenInput>;
}, TContext>;
export type RegisterGardenTokenMutationResult = NonNullable<Awaited<ReturnType<typeof registerGardenToken>>>;
export type RegisterGardenTokenMutationBody = BodyType<GardenTokenInput>;
export type RegisterGardenTokenMutationError = ErrorType<unknown>;
/**
* @summary Register or update a device push token for a flat
*/
export declare const useRegisterGardenToken: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerGardenToken>>, TError, {
        data: BodyType<GardenTokenInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof registerGardenToken>>, TError, {
    data: BodyType<GardenTokenInput>;
}, TContext>;
export declare const getDeleteGardenReservationUrl: (id: number) => string;
/**
 * @summary Cancel a reservation
 */
export declare const deleteGardenReservation: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteGardenReservationMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGardenReservation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteGardenReservation>>, TError, {
    id: number;
}, TContext>;
export type DeleteGardenReservationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteGardenReservation>>>;
export type DeleteGardenReservationMutationError = ErrorType<void>;
/**
* @summary Cancel a reservation
*/
export declare const useDeleteGardenReservation: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteGardenReservation>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteGardenReservation>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map